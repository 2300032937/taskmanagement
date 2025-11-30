"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR, { mutate } from "swr"
import {
  ListTodo,
  Plus,
  Search,
  LogOut,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  Circle,
  Filter,
  Calendar,
  Edit2,
  Trash2,
  ChevronDown,
  Menu,
  Bell,
  BellRing,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Task } from "@/lib/db"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type FilterState = {
  status: string
  priority: string
  search: string
}

export function DashboardClient({ user }: { user: { id: number; name: string; email: string } }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    priority: "all",
    search: "",
  })
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "todo" | "in_progress" | "completed">("all")
  const [reminderNotification, setReminderNotification] = useState<Task | null>(null)

  // Build query string
  const queryParams = new URLSearchParams()
  if (activeTab !== "all") queryParams.set("status", activeTab)
  if (filters.priority !== "all") queryParams.set("priority", filters.priority)
  if (filters.search) queryParams.set("search", filters.search)
  const queryString = queryParams.toString()

  const { data, error, isLoading } = useSWR(`/api/tasks${queryString ? `?${queryString}` : ""}`, fetcher)

  const tasks: Task[] = data?.tasks || []

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      tasks.forEach((task) => {
        if (task.reminder && task.status !== "completed") {
          const reminderDate = new Date(task.reminder)
          // Check if reminder is within the last minute (to avoid duplicate notifications)
          const timeDiff = now.getTime() - reminderDate.getTime()
          if (timeDiff >= 0 && timeDiff < 60000) {
            setReminderNotification(task)
          }
        }
      })
    }

    checkReminders()
    const interval = setInterval(checkReminders, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [tasks])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const handleAddTask = async (formData: FormData) => {
    const reminderDate = formData.get("reminder_date") as string
    const reminderTime = formData.get("reminder_time") as string
    const reminder = reminderDate && reminderTime ? `${reminderDate}T${reminderTime}` : null

    const newTask = {
      title: formData.get("title"),
      description: formData.get("description"),
      priority: formData.get("priority"),
      status: formData.get("status"),
      due_date: formData.get("due_date") || null,
      reminder,
    }

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    })

    mutate(`/api/tasks${queryString ? `?${queryString}` : ""}`)
    setAddModalOpen(false)
  }

  const handleEditTask = async (formData: FormData) => {
    if (!editingTask) return

    const reminderDate = formData.get("reminder_date") as string
    const reminderTime = formData.get("reminder_time") as string
    const reminder = reminderDate && reminderTime ? `${reminderDate}T${reminderTime}` : null

    const updatedTask = {
      title: formData.get("title"),
      description: formData.get("description"),
      priority: formData.get("priority"),
      status: formData.get("status"),
      due_date: formData.get("due_date") || null,
      reminder,
    }

    await fetch(`/api/tasks/${editingTask.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),

    })

    mutate(`/api/tasks${queryString ? `?${queryString}` : ""}`)
    setEditModalOpen(false)
    setEditingTask(null)
  }

  const handleDeleteTask = async (taskId: number) => {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" })
    mutate(`/api/tasks${queryString ? `?${queryString}` : ""}`)
  }

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    mutate(`/api/tasks${queryString ? `?${queryString}` : ""}`)
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setEditModalOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return <Circle className="w-4 h-4 text-muted-foreground" />
      case "in_progress":
        return <Clock className="w-4 h-4 text-amber-500" />
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      default:
        return <Circle className="w-4 h-4" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: "bg-slate-100 text-slate-600",
      medium: "bg-amber-100 text-amber-700",
      high: "bg-red-100 text-red-700",
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[priority as keyof typeof styles]}`}>
        {priority}
      </span>
    )
  }

  const formatReminder = (reminder: string) => {
    const date = new Date(reminder)
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const isReminderUpcoming = (reminder: string) => {
    const reminderDate = new Date(reminder)
    const now = new Date()
    const timeDiff = reminderDate.getTime() - now.getTime()
    return timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000
  }

  const getReminderParts = (reminder: string | null) => {
    if (!reminder) return { date: "", time: "" }
    const d = new Date(reminder)
    return {
      date: d.toISOString().split("T")[0],
      time: d.toTimeString().slice(0, 5),
    }
  }

  const tabCounts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <Dialog open={!!reminderNotification} onOpenChange={() => setReminderNotification(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-primary animate-pulse" />
              Task Reminder
            </DialogTitle>
          </DialogHeader>
          {reminderNotification && (
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-foreground mb-1">{reminderNotification.title}</h3>
                {reminderNotification.description && (
                  <p className="text-sm text-muted-foreground">{reminderNotification.description}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  {getPriorityBadge(reminderNotification.priority)}
                  {reminderNotification.due_date && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Due: {new Date(reminderNotification.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setReminderNotification(null)}>
                  Dismiss
                </Button>
                <Button
                  onClick={() => {
                    openEditModal(reminderNotification)
                    setReminderNotification(null)
                  }}
                >
                  View Task
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ListTodo className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">TaskFlow</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              All Tasks
              <span className="ml-auto text-xs">{tabCounts.all}</span>
            </button>
            <button
              onClick={() => setActiveTab("todo")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "todo"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Circle className="w-5 h-5" />
              To-Do
              <span className="ml-auto text-xs">{tabCounts.todo}</span>
            </button>
            <button
              onClick={() => setActiveTab("in_progress")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "in_progress"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Clock className="w-5 h-5" />
              In Progress
              <span className="ml-auto text-xs">{tabCounts.in_progress}</span>
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "completed"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              Completed
              <span className="ml-auto text-xs">{tabCounts.completed}</span>
            </button>
          </nav>

          {/* User */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>

            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-9"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            {/* Filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="w-4 h-4" />
                  Priority
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilters({ ...filters, priority: "all" })}>
                  All Priorities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({ ...filters, priority: "high" })}>High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({ ...filters, priority: "medium" })}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({ ...filters, priority: "low" })}>Low</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Task Button */}
            <Button onClick={() => setAddModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {activeTab === "all"
                ? "All Tasks"
                : activeTab === "todo"
                  ? "To-Do"
                  : activeTab === "in_progress"
                    ? "In Progress"
                    : "Completed"}
            </h1>
            <p className="text-muted-foreground">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
              {filters.priority !== "all" && ` • ${filters.priority} priority`}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ListTodo className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.priority !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first task to get started"}
              </p>
              <Button onClick={() => setAddModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <h3 className="font-medium text-foreground line-clamp-1">{task.title}</h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(task)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{task.description}</p>
                  )}

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(task.priority)}
                      {task.due_date && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {task.reminder && task.status !== "completed" && (
                      <span
                        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          isReminderUpcoming(task.reminder)
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Bell className="w-3 h-3" />
                        {formatReminder(task.reminder)}
                      </span>
                    )}
                  </div>

                  {/* Quick Status Change */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <Select value={task.status} onValueChange={(value) => handleStatusChange(task.id, value)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To-Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Task Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAddTask(new FormData(e.currentTarget))
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="add-title">Title</Label>
              <Input id="add-title" name="title" placeholder="Task title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-description">Description</Label>
              <Textarea id="add-description" name="description" placeholder="Task description (optional)" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-priority">Priority</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-status">Status</Label>
                <Select name="status" defaultValue="todo">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To-Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-due-date">Due Date</Label>
              <Input id="add-due-date" name="due_date" type="date" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Reminder
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input id="add-reminder-date" name="reminder_date" type="date" placeholder="Date" />
                <Input id="add-reminder-time" name="reminder_time" type="time" placeholder="Time" />
              </div>
              <p className="text-xs text-muted-foreground">Set a date and time to be reminded about this task</p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleEditTask(new FormData(e.currentTarget))
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input id="edit-title" name="title" defaultValue={editingTask.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingTask.description || ""}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select name="priority" defaultValue={editingTask.priority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select name="status" defaultValue={editingTask.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To-Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-due-date">Due Date</Label>
                <Input id="edit-due-date" name="due_date" type="date" defaultValue={editingTask.due_date || ""} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Reminder
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="edit-reminder-date"
                    name="reminder_date"
                    type="date"
                    defaultValue={getReminderParts(editingTask.reminder).date}
                  />
                  <Input
                    id="edit-reminder-time"
                    name="reminder_time"
                    type="time"
                    defaultValue={getReminderParts(editingTask.reminder).time}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Set a date and time to be reminded about this task</p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
