
import { supabase } from '@/integrations/supabase/client';
import { fetchOpenAppointments } from '@/utils/apiUtils';
import { FokusarkAppointment } from '@/api/fokusarkAppointmentsApi';

export const fetchAppointments = async (): Promise<any[]> => {
  try {
    // Since there's no 'api' export in apiUtils, let's use the fetchOpenAppointments function directly
    const appointments = await fetchOpenAppointments();
    return appointments;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
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
    console.log(`Inserting rows to Supabase: ${appointments.length}`);
    
    // Transform appointments to the format expected by Supabase table
    const rows = appointments.map((appointment, index) => {
      // Get the transformed data for this appointment
      const transformedData = mapAppointmentToTableRow(appointment);
      
      return {
        id: index.toString(), // Use index as ID for simplicity
        '1 col': transformedData[0] || '', // Appointment number
        '2 col': transformedData[1] || '', // Subject
        '3 col': transformedData[2] || '', // Type
        '4 col': transformedData[3] || '', // Tilbud
        '5 col': transformedData[4] || '', // Montage
        '6 col': transformedData[5] || '', // Underleverandør
        '7 col': transformedData[6] || '', // Montage 2 (editable)
        '8 col': transformedData[7] || '', // Underleverandør 2 (editable)
        '9 col': transformedData[8] || '', // Materialer
        '10 col': transformedData[9] || '', // Projektering
        '11 col': transformedData[10] || '', // Produktion
        '12 col': transformedData[11] || '', // Montage 3
        '13 col': transformedData[12] || '', // Projektering Realiseret
        '14 col': transformedData[13] || '', // Produktion Realiseret
        '15 col': transformedData[14] || '', // Montage Realiseret
        '16 col': transformedData[15] || '', // Total Realiseret
        '17 col': transformedData[16] || '', // Special
        '18 col': transformedData[17] || '', // Færdig % Nu
        '19 col': transformedData[18] || '', // Færdig % Før
        '20 col': transformedData[19] || '', // Est. Timer
        '21 col': transformedData[20] || '', // +/- Timer
        '22 col': transformedData[21] || '', // Afsat Fragt
        '23 col': transformedData[22] || '',
        '24 col': transformedData[23] || '' // Flag for sub-appointment
      };
    });
    
    // Use upsert to insert or update rows
    const { error } = await supabase
      .from('fokusark_table')
      .upsert(rows, { 
        onConflict: 'id',
        ignoreDuplicates: false
      });
      
    if (error) {
      console.error('Error saving to Supabase:', error);
      return false;
    }
    
    console.log('Successfully saved appointments to Supabase');
    return true;
  } catch (error) {
    console.error('Error in saveAppointmentsToSupabase:', error);
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
