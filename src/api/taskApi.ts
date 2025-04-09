
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";

export async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false }) as unknown as {
      data: Task[] | null;
      error: Error | null;
    };
    
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
    .single() as unknown as {
      data: Task | null;
      error: Error | null;
    };
    
  if (error) throw error;
  return data as Task;
}

export async function updateTask(id: string, task: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', id)
    .select()
    .single() as unknown as {
      data: Task | null;
      error: Error | null;
    };
    
  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id) as unknown as {
      error: Error | null;
    };
    
  if (error) throw error;
}
