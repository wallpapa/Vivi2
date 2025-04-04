import { motion } from 'framer-motion'
import { Button } from './ui/button'

export function WelcomeScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <h1 className="text-5xl font-bold tracking-tight">
          Welcome to <span className="text-primary">Vivi2</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Your modern clinic management system. Built with React, TypeScript, and Supabase.
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button size="lg" className="mt-4">
            Get Started
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
} 