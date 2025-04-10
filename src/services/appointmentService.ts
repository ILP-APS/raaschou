
import { supabase } from '@/integrations/supabase/client';
import { fetchOpenAppointments } from '@/utils/apiUtils';
import { FokusarkAppointment } from '@/api/fokusarkAppointmentsApi';
import { toast } from 'sonner';

export const fetchAppointments = async (): Promise<any[]> => {
  try {
    // First try to fetch from Supabase
    const { data: supabaseData, error } = await supabase
      .from('fokusark_table')
      .select('*');
    
    if (error) {
      console.error('Error fetching from Supabase:', error);
      // Fall back to mock data if Supabase fails
      console.log('Falling back to mock data...');
      return await fetchOpenAppointments();
    }
    
    if (supabaseData && supabaseData.length > 0) {
      console.log(`Fetched ${supabaseData.length} records from Supabase`);
      // Transform data from Supabase format to the expected format
      return supabaseData.map(row => ({
        hnAppointmentID: parseInt(row['1 col'] || '0'),
        appointmentNumber: row['1 col'] || '',
        subject: row['2 col'] || '',
        responsibleHnUserName: row['3 col'] || '',
        montage: row['5 col'] || '',
        underleverandor: row['6 col'] || '',
        montage2: row['7 col'] || '',
        underleverandor2: row['8 col'] || '',
        materialer: row['9 col'] || '',
        projektering_1: row['10 col'] || '',
        produktion: row['11 col'] || '',
        montage_3: row['12 col'] || '',
        projektering_2: row['13 col'] || '',
        produktion_realized: row['14 col'] || '',
        montage_3_realized: row['15 col'] || '',
        total: row['16 col'] || '',
        timer_tilbage_1: row['17 col'] || '',
        timer_tilbage_2: row['18 col'] || '',
        faerdig_pct_ex_montage_nu: row['19 col'] || '',
        faerdig_pct_ex_montage_foer: row['20 col'] || '',
        est_timer_ift_faerdig_pct: row['21 col'] || '',
        plus_minus_timer: row['22 col'] || '',
        afsat_fragt: row['23 col'] || '',
        done: false
      }));
    }
    
    // If no data in Supabase, use mock data
    console.log('No data found in Supabase, using mock data');
    return await fetchOpenAppointments();
  } catch (error) {
    console.error('Error fetching appointments:', error);
    // Always fall back to mock data on error
    console.log('Error caught, falling back to mock data');
    return await fetchOpenAppointments();
  }
};

export const mapAppointmentsToTableData = async (appointments: any[]): Promise<string[][]> => {
  return appointments.map(appointment => {
    return [
      appointment.appointment_number || '',
      appointment.subject || '',
      appointment.responsible_user || '',
      appointment.tilbud || '',
      appointment.montage || '',
      appointment.underleverandor || '',
      appointment.montage2 || '',
      appointment.underleverandor2 || '',
      appointment.materialer || '',
      appointment.projektering_1 || '',
      appointment.produktion || '',
      appointment.montage_3 || '',
      appointment.projektering_2 || '',
      appointment.produktion_realized || '',
      appointment.montage_3_realized || '',
      appointment.total || '',
      appointment.timer_tilbage_1 || '',
      appointment.timer_tilbage_2 || '',
      appointment.faerdig_pct_ex_montage_nu || '',
      appointment.faerdig_pct_ex_montage_foer || '',
      appointment.est_timer_ift_faerdig_pct || '',
      appointment.plus_minus_timer || '',
      appointment.afsat_fragt || '',
      'regular-appointment'
    ];
  });
};

export const saveAppointmentsToSupabase = async (appointments: any[]): Promise<boolean> => {
  try {
    console.log(`Inserting ${appointments.length} rows to Supabase`);
    
    // Transform appointments to the format expected by Supabase table
    const rows = appointments.map((appointment, index) => {
      const row: Record<string, any> = {
        id: appointment.hnAppointmentID ? appointment.hnAppointmentID.toString() : index.toString(),
        '1 col': appointment.appointmentNumber || '',
        '2 col': appointment.subject || '',
        '3 col': appointment.responsibleHnUserName || '',
      };
      
      // Add all other columns
      if (appointment.tilbud) row['4 col'] = appointment.tilbud;
      if (appointment.montage) row['5 col'] = appointment.montage;
      if (appointment.underleverandor) row['6 col'] = appointment.underleverandor;
      if (appointment.montage2) row['7 col'] = appointment.montage2;
      if (appointment.underleverandor2) row['8 col'] = appointment.underleverandor2;
      if (appointment.materialer) row['9 col'] = appointment.materialer;
      if (appointment.projektering_1) row['10 col'] = appointment.projektering_1;
      if (appointment.produktion) row['11 col'] = appointment.produktion;
      if (appointment.montage_3) row['12 col'] = appointment.montage_3;
      if (appointment.projektering_2) row['13 col'] = appointment.projektering_2;
      if (appointment.produktion_realized) row['14 col'] = appointment.produktion_realized;
      if (appointment.montage_3_realized) row['15 col'] = appointment.montage_3_realized;
      if (appointment.total) row['16 col'] = appointment.total;
      if (appointment.timer_tilbage_1) row['17 col'] = appointment.timer_tilbage_1;
      if (appointment.timer_tilbage_2) row['18 col'] = appointment.timer_tilbage_2;
      if (appointment.faerdig_pct_ex_montage_nu) row['19 col'] = appointment.faerdig_pct_ex_montage_nu;
      if (appointment.faerdig_pct_ex_montage_foer) row['20 col'] = appointment.faerdig_pct_ex_montage_foer;
      if (appointment.est_timer_ift_faerdig_pct) row['21 col'] = appointment.est_timer_ift_faerdig_pct;
      if (appointment.plus_minus_timer) row['22 col'] = appointment.plus_minus_timer;
      if (appointment.afsat_fragt) row['23 col'] = appointment.afsat_fragt;
      
      return row;
    });
    
    // Delete existing data first
    const { error: deleteError } = await supabase
      .from('fokusark_table')
      .delete()
      .neq('id', 'placeholder'); // This will delete all rows
    
    if (deleteError) {
      console.error('Error deleting existing data:', deleteError);
      // Continue anyway to try inserting new data
    }
    
    // Use upsert to insert or update rows
    const { error } = await supabase
      .from('fokusark_table')
      .upsert(rows, { 
        onConflict: 'id',
        ignoreDuplicates: false
      });
      
    if (error) {
      console.error('Error saving to Supabase:', error);
      toast.error('Failed to save to Supabase: ' + error.message);
      return false;
    }
    
    console.log('Successfully saved appointments to Supabase');
    return true;
  } catch (error) {
    console.error('Error in saveAppointmentsToSupabase:', error);
    toast.error('Error saving data: ' + (error as Error).message);
    return false;
  }
};

// Helper function to transform appointment to table row format
function mapAppointmentToTableRow(appointment: any): string[] {
  return mapAppointmentToTableData(appointment);
}

// This function should already exist, but make sure it includes all columns
function mapAppointmentToTableData(appointment: any): string[] {
  return [
    appointment.appointment_number || '',
    appointment.subject || '',
    appointment.responsible_user || '',
    appointment.tilbud || '',
    appointment.montage || '',
    appointment.underleverandor || '',
    appointment.montage2 || '',
    appointment.underleverandor2 || '',
    appointment.materialer || '',
    appointment.projektering_1 || '',
    appointment.produktion || '',
    appointment.montage_3 || '',
    appointment.projektering_2 || '',
    appointment.produktion_realized || '',
    appointment.montage_3_realized || '',
    appointment.total || '',
    appointment.timer_tilbage_1 || '',
    appointment.timer_tilbage_2 || '',
    appointment.faerdig_pct_ex_montage_nu || '',
    appointment.faerdig_pct_ex_montage_foer || '',
    appointment.est_timer_ift_faerdig_pct || '',
    appointment.plus_minus_timer || '',
    appointment.afsat_fragt || '',
    'regular-appointment'
  ];
}

export const loadAppointmentsFromSupabase = async (): Promise<string[][] | null> => {
  try {
    console.log('Loading appointments from Supabase...');
    const { data, error } = await supabase
      .from('fokusark_table')
      .select('*');
    
    if (error) {
      console.error('Error fetching appointments from Supabase:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.warn('No appointments found in Supabase');
      return null;
    }
    
    console.log(`Loaded ${data.length} appointments from Supabase`);
    
    // Convert Supabase data to the format expected by the table
    const tableData: string[][] = data.map(row => [
      row['1 col'] || '',
      row['2 col'] || '',
      row['3 col'] || '',
      row['4 col'] || '',
      row['5 col'] || '',
      row['6 col'] || '',
      row['7 col'] || '',
      row['8 col'] || '',
      row['9 col'] || '',
      row['10 col'] || '',
      row['11 col'] || '',
      row['12 col'] || '',
      row['13 col'] || '',
      row['14 col'] || '',
      row['15 col'] || '',
      row['16 col'] || '',
      row['17 col'] || '',
      row['18 col'] || '',
      row['19 col'] || '',
      row['20 col'] || '',
      row['21 col'] || '',
      row['22 col'] || '',
      row['23 col'] || '',
      'regular-appointment'
    ]);
    
    return tableData;
  } catch (error) {
    console.error('Error loading appointments from Supabase:', error);
    return null;
  }
};
