import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type RangeKey = 'all' | '90d' | '12m';

function getRangeDates(range: RangeKey): { from?: string; to: string } {
  const to = new Date();
  if (range === 'all') return { to: to.toISOString() };
  const from = new Date();
  if (range === '90d') {
    from.setDate(from.getDate() - 90);
  } else if (range === '12m') {
    from.setMonth(from.getMonth() - 12);
  }
  return { from: from.toISOString(), to: to.toISOString() };
}

Deno.serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Get auth header from request (passed automatically by Supabase client)
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Parse query params - support both GET (query params) and POST (body)
    const url = new URL(req.url);
    let rangeParam: RangeKey = 'all';
    
    // Try to get range from query params first (for GET requests or direct URL access)
    if (url.searchParams.has('range')) {
      rangeParam = (url.searchParams.get('range') as RangeKey) || 'all';
    } else if (req.method === 'POST') {
      // For POST requests, try to read from body
      try {
        const body = await req.json();
        rangeParam = (body.range as RangeKey) || 'all';
      } catch {
        // If body parsing fails, default to 'all'
        rangeParam = 'all';
      }
    }
    const { from, to } = getRangeDates(rangeParam);

    // Total members (all-time)
    const { count: totalMembers, error: totalMembersError } = await supabase
      .from('community_members')
      .select('*', { count: 'exact', head: true });

    if (totalMembersError) throw totalMembersError;

    // Total events (respect range if provided)
    let eventsQuery = supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    if (from) eventsQuery = eventsQuery.gte('event_date', from);
    eventsQuery = eventsQuery.lte('event_date', to);
    const { count: totalEvents, error: totalEventsError } = await eventsQuery;
    if (totalEventsError) throw totalEventsError;

    // Distinct attendees in range from attendance facts
    let attendeesQuery = supabase
      .from('org_attendance_facts_v')
      .select('member_id', { count: 'exact', head: true });
    if (from) attendeesQuery = attendeesQuery.gte('attended_at', from);
    attendeesQuery = attendeesQuery.lte('attended_at', to);
    const { count: attendeesDistinct, error: attendeesError } = await attendeesQuery;
    if (attendeesError) throw attendeesError;

    // Total attendance rows in range for avg per event
    let attendanceRowsQuery = supabase
      .from('org_attendance_facts_v')
      .select('*', { count: 'exact', head: true });
    if (from) attendanceRowsQuery = attendanceRowsQuery.gte('attended_at', from);
    attendanceRowsQuery = attendanceRowsQuery.lte('attended_at', to);
    const { count: totalAttendanceRows, error: attendanceRowsError } = await attendanceRowsQuery;
    if (attendanceRowsError) throw attendanceRowsError;

    const activeMembers = attendeesDistinct || 0;
    const pctMembersAttended = totalMembers
      ? (activeMembers / totalMembers) * 100
      : 0;
    const avgAttendancePerEvent = totalEvents
      ? (Number(totalAttendanceRows || 0) / totalEvents)
      : 0;

    return new Response(
      JSON.stringify({
        range: rangeParam,
        totals: {
          members: totalMembers || 0,
          events: totalEvents || 0,
          attendanceRows: totalAttendanceRows || 0,
        },
        activeMembers,
        pctMembersAttended,
        avgAttendancePerEvent,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

