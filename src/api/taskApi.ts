
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";

export async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
  
  return data as Task[];
}

export async function createTask(newTask: Omit<Task, 'id'>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([newTask])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, task: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}
