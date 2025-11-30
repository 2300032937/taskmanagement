import type React from "react"
import Link from "next/link"
import { CheckCircle, ListTodo, Clock, ArrowRight, Sparkles, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ListTodo className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">TaskFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Simple. Powerful. Productive.
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Manage Your Tasks
            <br />
            <span className="text-primary">With Ease</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            Stay organized and boost your productivity with TaskFlow. The simple yet powerful task management solution
            for individuals and teams.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help you manage your tasks efficiently
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ListTodo className="w-6 h-6" />}
              title="Task Organization"
              description="Organize tasks into To-Do, In-Progress, and Completed categories. Keep track of everything in one place."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="Due Date Tracking"
              description="Set due dates and priorities. Never miss a deadline with our intuitive date tracking system."
            />
            <FeatureCard
              icon={<CheckCircle className="w-6 h-6" />}
              title="Progress Monitoring"
              description="Track your progress and celebrate completions. Stay motivated with visual progress indicators."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Quick Actions"
              description="Add, edit, and manage tasks with lightning speed. Intuitive interface for maximum productivity."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Secure & Private"
              description="Your data is encrypted and secure. We take your privacy seriously with industry-standard security."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Clean Interface"
              description="Beautiful, minimal design that stays out of your way. Focus on what matters - getting things done."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
            Join thousands of users who have transformed their productivity with TaskFlow.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <ListTodo className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-medium text-foreground">TaskFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 TaskFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow duration-300">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
