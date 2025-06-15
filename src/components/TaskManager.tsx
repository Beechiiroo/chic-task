import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, Calendar as CalendarIcon, Flag, Check, Trash2, Search, Filter, 
  Edit3, Clock, Target, TrendingUp, CheckCircle2, Circle, AlertCircle,
  BarChart3, Archive, Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  tags: string[];
  estimatedHours?: number;
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: 'work',
    dueDate: undefined as Date | undefined,
    estimatedHours: undefined as number | undefined
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { toast } = useToast();

  // Filtered and searched tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'completed' && task.completed) ||
                           (filterStatus === 'pending' && !task.completed);
      
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [tasks, searchTerm, filterStatus, filterPriority, filterCategory]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < new Date()).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pending, overdue, progress };
  }, [tasks]);

  const addTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive"
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
      createdAt: new Date(),
      tags: []
    };

    setTasks([task, ...tasks]);
    setNewTask({ 
      title: '', 
      description: '', 
      priority: 'medium', 
      category: 'work',
      dueDate: undefined,
      estimatedHours: undefined
    });
    setShowAddForm(false);
    
    toast({
      title: "Task created! 🎉",
      description: "Your task has been successfully added to your list.",
    });
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    setEditingTask(null);
    setSelectedTask(null);
    
    toast({
      title: "Task updated",
      description: "Your changes have been saved successfully.",
    });
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, completed: !task.completed };
        if (updatedTask.completed) {
          toast({
            title: "Great work! ✅",
            description: `"${task.title}" has been completed.`,
          });
        }
        return updatedTask;
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks(tasks.filter(task => task.id !== id));
    setSelectedTask(null);
    
    toast({
      title: "Task deleted",
      description: `"${taskToDelete?.title}" has been removed from your list.`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300';
      case 'medium': return 'bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300';
      case 'low': return 'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work': return 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300';
      case 'personal': return 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300';
      case 'health': return 'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300';
      case 'learning': return 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <Circle className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const isOverdue = (task: Task) => {
    return !task.completed && task.dueDate && task.dueDate < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-3">
            Professional Task Manager
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Organize, prioritize, and achieve your goals with our advanced task management system
          </p>
        </div>

        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
                  <div className="flex items-center mt-2">
                    <Progress value={stats.progress} className="h-2 w-16" />
                    <span className="text-sm text-muted-foreground ml-2">{stats.progress}%</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground mt-2">In Progress</p>
                </div>
                <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground mt-2">Finished</p>
                </div>
                <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</p>
                  <p className="text-sm text-muted-foreground mt-2">Need Attention</p>
                </div>
                <div className="p-3 bg-red-500/10 dark:bg-red-500/20 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Controls */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-0 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 transition-colors w-64"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32 border-0 bg-slate-50 dark:bg-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32 border-0 bg-slate-50 dark:bg-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-32 border-0 bg-slate-50 dark:bg-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Task
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Add Task Form */}
        {showAddForm && (
          <Card className="mb-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-2xl animate-fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                <Plus className="h-6 w-6 mr-2 text-blue-600" />
                Create New Task
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    placeholder="What needs to be done?"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="border-0 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 transition-colors text-lg"
                  />
                  
                  <Textarea
                    placeholder="Add more details about this task..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="border-0 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 transition-colors min-h-24"
                  />
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                      <SelectTrigger className="border-0 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">🔴 High Priority</SelectItem>
                        <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                        <SelectItem value="low">🟢 Low Priority</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                      <SelectTrigger className="border-0 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work">💼 Work</SelectItem>
                        <SelectItem value="personal">👤 Personal</SelectItem>
                        <SelectItem value="health">🏃 Health</SelectItem>
                        <SelectItem value="learning">📚 Learning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal border-0 bg-slate-50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600",
                            !newTask.dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newTask.dueDate ? format(newTask.dueDate, "PPP") : "Due date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newTask.dueDate}
                          onSelect={(date) => setNewTask({ ...newTask, dueDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Input
                      type="number"
                      placeholder="Estimated hours"
                      value={newTask.estimatedHours || ''}
                      onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value ? Number(e.target.value) : undefined })}
                      className="border-0 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 transition-colors"
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-3">
                <Button 
                  onClick={addTask} 
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <Card 
              key={task.id} 
              className={cn(
                "group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer",
                task.completed && "opacity-75",
                isOverdue(task) && "ring-2 ring-red-200 dark:ring-red-800"
              )}
              onClick={() => setSelectedTask(task)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className={cn(
                      "text-lg font-semibold leading-tight mb-2",
                      task.completed ? 'line-through text-muted-foreground' : 'text-slate-900 dark:text-slate-100'
                    )}>
                      {task.title}
                    </CardTitle>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className={cn("border", getPriorityColor(task.priority))}>
                        {getPriorityIcon(task.priority)}
                        <span className="ml-1 capitalize">{task.priority}</span>
                      </Badge>
                      <Badge className={cn("border", getCategoryColor(task.category))}>
                        {task.category}
                      </Badge>
                      {isOverdue(task) && (
                        <Badge className="bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTask(task);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {task.description && (
                  <p className={cn(
                    "text-sm mb-4 line-clamp-2",
                    task.completed ? 'line-through text-muted-foreground' : 'text-slate-600 dark:text-slate-300'
                  )}>
                    {task.description}
                  </p>
                )}
                
                {task.dueDate && (
                  <div className={cn(
                    "flex items-center text-sm mb-3",
                    isOverdue(task) ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                  )}>
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Due {format(task.dueDate, "MMM d, yyyy")}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(task.createdAt, "MMM d")}
                    {task.estimatedHours && (
                      <span className="ml-2">{task.estimatedHours}h</span>
                    )}
                  </div>
                  
                  <Button
                    variant={task.completed ? "secondary" : "default"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTask(task.id);
                    }}
                    className={cn(
                      "transform hover:scale-105 transition-all duration-200",
                      task.completed 
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300" 
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    )}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {task.completed ? 'Done' : 'Complete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-16 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
                  <Target className="h-12 w-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all' 
                  ? 'No tasks match your filters' 
                  : 'No tasks yet'
                }
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all'
                  ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                  : 'Create your first task to begin your productivity journey. Every great achievement starts with a single step.'
                }
              </p>
              {(!searchTerm && filterStatus === 'all' && filterPriority === 'all' && filterCategory === 'all') && (
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Task
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Task Details Modal */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-2xl">
            {selectedTask && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    {selectedTask.completed ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <Circle className="h-6 w-6" />}
                    {selectedTask.title}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={cn("border", getPriorityColor(selectedTask.priority))}>
                      {getPriorityIcon(selectedTask.priority)}
                      <span className="ml-1 capitalize">{selectedTask.priority} Priority</span>
                    </Badge>
                    <Badge className={cn("border", getCategoryColor(selectedTask.category))}>
                      {selectedTask.category}
                    </Badge>
                    {selectedTask.completed && (
                      <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                    {isOverdue(selectedTask) && (
                      <Badge className="bg-red-500/10 text-red-700 border-red-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Overdue
                      </Badge>
                    )}
                  </div>

                  {selectedTask.description && (
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-muted-foreground">{selectedTask.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Created</h4>
                      <p className="text-muted-foreground">{format(selectedTask.createdAt, "PPP")}</p>
                    </div>
                    
                    {selectedTask.dueDate && (
                      <div>
                        <h4 className="font-semibold mb-2">Due Date</h4>
                        <p className={cn(
                          "font-medium",
                          isOverdue(selectedTask) ? "text-red-600" : "text-muted-foreground"
                        )}>
                          {format(selectedTask.dueDate, "PPP")}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedTask.estimatedHours && (
                    <div>
                      <h4 className="font-semibold mb-2">Estimated Time</h4>
                      <p className="text-muted-foreground">{selectedTask.estimatedHours} hours</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => toggleTask(selectedTask.id)}
                      className={cn(
                        "flex-1",
                        selectedTask.completed 
                          ? "bg-amber-600 hover:bg-amber-700" 
                          : "bg-emerald-600 hover:bg-emerald-700"
                      )}
                    >
                      {selectedTask.completed ? 'Mark as Pending' : 'Mark as Complete'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingTask(selectedTask);
                        setSelectedTask(null);
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteTask(selectedTask.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Task Modal */}
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="max-w-2xl">
            {editingTask && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Edit Task</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <Input
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="text-lg"
                  />
                  
                  <Textarea
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className="min-h-24"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Select 
                      value={editingTask.priority} 
                      onValueChange={(value: any) => setEditingTask({ ...editingTask, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={editingTask.category} 
                      onValueChange={(value) => setEditingTask({ ...editingTask, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !editingTask.dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editingTask.dueDate ? format(editingTask.dueDate, "PPP") : "Due date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editingTask.dueDate}
                          onSelect={(date) => setEditingTask({ ...editingTask, dueDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Input
                      type="number"
                      placeholder="Estimated hours"
                      value={editingTask.estimatedHours || ''}
                      onChange={(e) => setEditingTask({ 
                        ...editingTask, 
                        estimatedHours: e.target.value ? Number(e.target.value) : undefined 
                      })}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button onClick={() => updateTask(editingTask)} className="flex-1">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingTask(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TaskManager;