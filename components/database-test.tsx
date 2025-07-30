"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function DatabaseTest() {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isCreatingTables, setIsCreatingTables] = useState(false)
  const { toast } = useToast()

  const testConnection = async () => {
    setIsTestingConnection(true)
    try {
      const { data, error } = await supabase.from("posts").select("count", { count: "exact", head: true })

      if (error) {
        console.error("Connection test error:", error)
        toast({
          title: "Connection Failed",
          description: `Database connection failed: ${error.message}`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Connection Successful",
          description: "Database connection is working properly!",
        })
      }
    } catch (error) {
      console.error("Connection test error:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect to database. Please check your configuration.",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const createTables = async () => {
    setIsCreatingTables(true)
    try {
      // Create posts table
      const { error: postsError } = await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS posts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT,
            description TEXT,
            embed_code TEXT,
            media_url TEXT,
            media_type TEXT,
            redirect_link TEXT,
            native_banner_ad TEXT,
            popunder_ad TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (postsError) {
        console.error("Posts table creation error:", postsError)
      }

      // Create generated_links table
      const { error: linksError } = await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS generated_links (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
            link_id TEXT UNIQUE NOT NULL,
            title TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (linksError) {
        console.error("Links table creation error:", linksError)
      }

      // Create indexes
      const { error: indexError } = await supabase.rpc("exec_sql", {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_generated_links_link_id ON generated_links(link_id);
          CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
        `,
      })

      if (indexError) {
        console.error("Index creation error:", indexError)
      }

      if (!postsError && !linksError && !indexError) {
        toast({
          title: "Tables Created",
          description: "Database tables have been created successfully!",
        })
      } else {
        toast({
          title: "Table Creation Failed",
          description: "Some tables may not have been created. Check console for details.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Table creation error:", error)
      toast({
        title: "Error",
        description: "Failed to create tables. You may need to run the SQL script manually.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingTables(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Database Setup & Testing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testConnection} disabled={isTestingConnection} variant="outline">
            {isTestingConnection ? "Testing..." : "Test Database Connection"}
          </Button>
          <Button onClick={createTables} disabled={isCreatingTables} variant="outline">
            {isCreatingTables ? "Creating..." : "Create Tables"}
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          First test the connection, then create tables if they don't exist. Check browser console for detailed logs.
        </p>
      </CardContent>
    </Card>
  )
}
