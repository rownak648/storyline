"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, LinkIcon, Trash2, Copy, Check, Database, ImageIcon, Lock } from "lucide-react"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { supabase, type GeneratedLink } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  title: string
  videoUrl: string,
  description: string
  embedCode: string
  mediaUrl: string
  mediaType: string
  thumbnailUrl: string
  redirectLink: string
  popunderAd: string
}

const ADMIN_PASSWORD = "Nayan563" // Change this to your desired password

export default function FormSection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [formData, setFormData] = useState<FormData>({
    title: "",
    videoUrl: "",
    description: "",
    embedCode: "",
    mediaUrl: "",
    mediaType: "",
    thumbnailUrl: "",
    redirectLink: "",
    popunderAd: "",
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [linkHistory, setLinkHistory] = useState<GeneratedLink[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [tablesExist, setTablesExist] = useState<boolean | null>(null)
  const [showSqlScript, setShowSqlScript] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const sqlScript = `-- Run this SQL script in your Supabase SQL Editor

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  embed_code TEXT,
  media_url TEXT,
  media_type TEXT,
  thumbnail_url TEXT,
  redirect_link TEXT,
  popunder_ad TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_links table
CREATE TABLE IF NOT EXISTS generated_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  link_id TEXT UNIQUE NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_links_link_id ON generated_links(link_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);`

  // Move function declarations before useEffect
  const loadLinkHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("generated_links")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error loading link history:", error)
        return
      }

      if (data) {
        setLinkHistory(data)
      }
    } catch (error) {
      console.error("Error loading link history:", error)
    }
  }

  const checkTablesAndLoadHistory = async () => {
    console.log("Checking tables and loading history...")
    try {
      const { data, error } = await supabase.from("generated_links").select("count", { count: "exact", head: true })

      if (error) {
        console.error("Tables don't exist:", error.message)
        setTablesExist(false)
        return
      }

      console.log("Tables exist, loading history...")
      setTablesExist(true)
      await loadLinkHistory()
    } catch (error) {
      console.error("Error checking tables:", error)
      setTablesExist(false)
    }
  }

  const handleAuthentication = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("truthvibe_auth", "authenticated")
      checkTablesAndLoadHistory()
      toast({
        title: "Access Granted",
        description: "Welcome to Social Media Post Generator!",
      })
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("truthvibe_auth")
    setPasswordInput("")
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    })
  }

  useEffect(() => {
    // Check if user is already authenticated (stored in localStorage)
    const authStatus = localStorage.getItem("truthvibe_auth")
    if (authStatus === "authenticated") {
      setIsAuthenticated(true)
      checkTablesAndLoadHistory()
    }
  }, [])

  // Authentication Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Social Media Access</CardTitle>
            <p className="text-gray-600">Enter password to access the post generator</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter access password"
                onKeyPress={(e) => e.key === "Enter" && handleAuthentication()}
              />
            </div>
            <Button onClick={handleAuthentication} className="w-full">
              <Lock className="w-4 h-4 mr-2" />
              Access Tool
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const { url, type } = await uploadToCloudinary(file)
      setFormData((prev) => ({
        ...prev,
        mediaUrl: url,
        mediaType: type,
      }))
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file for thumbnail.",
        variant: "destructive",
      })
      return
    }

    setIsThumbnailUploading(true)
    try {
      const { url } = await uploadToCloudinary(file)
      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: url,
      }))
      toast({
        title: "Success",
        description: "Thumbnail uploaded successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload thumbnail. Please try again.",
      })
    } finally {
      setIsThumbnailUploading(false)
    }
  }

  const validateForm = (): boolean => {
    console.log("Validating form...")
    console.log("Title:", formData.title.trim())
    console.log("Description:", formData.description.trim())
    console.log("Redirect Link:", formData.redirectLink.trim())
    console.log("Popunder Ad:", formData.popunderAd.trim())

    // Either title or description must be provided
    if (!formData.title.trim() && !formData.description.trim()) {
      console.log("Validation failed: No title or description")
      toast({
        title: "Validation Error",
        description: "Either Title or Description is required.",
        variant: "destructive",
      })
      return false
    }

    // At least one of redirect link or popunder ad must be provided
    if (!formData.redirectLink.trim() && !formData.popunderAd.trim()) {
      console.log("Validation failed: No monetization method")
      toast({
        title: "Validation Error",
        description: "At least one of Redirect Link or Popunder Ad is required.",
        variant: "destructive",
      })
      return false
    }

    console.log("Form validation passed")
    return true
  }

  const generateLink = async () => {
    console.log("Generate Link clicked")
    console.log("Form data:", formData)

    if (!validateForm()) {
      console.log("Form validation failed")
      return
    }

    if (tablesExist === false) {
      console.log("Tables don't exist")
      toast({
        title: "Setup Required",
        description: "Please create the database tables first using the SQL script below.",
        variant: "destructive",
      })
      setShowSqlScript(true)
      return
    }

    if (tablesExist === null) {
      console.log("Tables status unknown, checking...")
      await checkTablesAndLoadHistory()
      if (tablesExist === false) {
        toast({
          title: "Setup Required",
          description: "Please create the database tables first using the SQL script below.",
          variant: "destructive",
        })
        setShowSqlScript(true)
        return
      }
    }

    setIsGenerating(true)
    console.log("Starting link generation...")

    try {
      // Insert post data
      const postInsertData = {
        title: formData.title.trim() || null,
        description: formData.description.trim() || null,
        embed_code: formData.embedCode.trim() || null,
        media_url: formData.mediaUrl || null,
        media_type: formData.mediaType || null,
        thumbnail_url: formData.thumbnailUrl || null,
        redirect_link: formData.redirectLink.trim() || null,
        popunder_ad: formData.popunderAd.trim() || null,
      }

      console.log("Inserting post data:", postInsertData)

      const { data: postData, error: postError } = await supabase.from("posts").insert(postInsertData).select().single()

      if (postError) {
        console.error("Post insert error:", postError)
        throw new Error(`Failed to create post: ${postError.message}`)
      }

      console.log("Post created successfully:", postData)

      // Generate unique link ID (6 characters)
      const linkId = Math.random().toString(36).substring(2, 8)
      console.log("Generated link ID:", linkId)

      // Insert generated link
      const linkInsertData = {
        post_id: postData.id,
        link_id: linkId,
        title: formData.title.trim() || formData.description.trim() || "Untitled",
      }

      console.log("Inserting link data:", linkInsertData)

      const { data: linkData, error: linkError } = await supabase
        .from("generated_links")
        .insert(linkInsertData)
        .select()
        .single()

      if (linkError) {
        console.error("Link insert error:", linkError)
        throw new Error(`Failed to create link: ${linkError.message}`)
      }

      console.log("Link created successfully:", linkData)

      // Update link history
      setLinkHistory((prev) => [linkData, ...prev])

      toast({
        title: "Success!",
        description: `Link generated successfully! URL: ${window.location.origin}/post/${linkId}`,
      })

      console.log("Link generation completed successfully")
    } catch (error) {
      console.error("Error generating link:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const clearForm = () => {
    setFormData({
      title: "",
      description: "",
      embedCode: "",
      mediaUrl: "",
      mediaType: "",
      thumbnailUrl: "",
      redirectLink: "",
      popunderAd: "",
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ""
    }
    toast({
      title: "Form Cleared",
      description: "All form data has been cleared.",
    })
  }

  const copyToClipboard = async (linkId: string) => {
    const url = `${window.location.origin}/post/${linkId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(linkId)
      setTimeout(() => setCopiedId(null), 3000)
      toast({
        title: "Link Copied!",
        description: "The generated link has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const copySqlScript = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript)
      toast({
        title: "SQL Script Copied!",
        description: "The SQL script has been copied to your clipboard. Paste it in Supabase SQL Editor.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy SQL script. Please select and copy manually.",
        variant: "destructive",
      })
    }
  }

  const deleteLink = async (linkId: string) => {
    if (!confirm("Are you sure you want to delete this link? This will also delete the associated post data.")) {
      return
    }

    try {
      // First get the post_id from the link
      const { data: linkData, error: linkFetchError } = await supabase
        .from("generated_links")
        .select("post_id")
        .eq("id", linkId)
        .single()

      if (linkFetchError) {
        throw new Error(`Failed to fetch link data: ${linkFetchError.message}`)
      }

      // Delete the post (this will cascade delete the link due to foreign key constraint)
      const { error: postDeleteError } = await supabase.from("posts").delete().eq("id", linkData.post_id)

      if (postDeleteError) {
        throw new Error(`Failed to delete post: ${postDeleteError.message}`)
      }

      // Update local state
      setLinkHistory((prev) => prev.filter((link) => link.id !== linkId))

      toast({
        title: "Link Deleted",
        description: "The link and associated post data have been successfully deleted from database.",
      })

      console.log("Successfully deleted post and link from database")
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const recheckTables = async () => {
    setTablesExist(null)
    await checkTablesAndLoadHistory()
    if (tablesExist === true) {
      setShowSqlScript(false)
      toast({
        title: "Success!",
        description: "Database tables found! You can now generate links.",
      })
    } else {
      toast({
        title: "Tables Not Found",
        description: "Please make sure you've run the SQL script in your Supabase dashboard.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with Logout */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Social Media Post Generator</h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <Lock className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Database Setup Warning */}
        {tablesExist === false && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800">Database Setup Required</h3>
                    <p className="text-sm text-red-700 mt-1">
                      The database tables need to be created before you can generate links.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowSqlScript(!showSqlScript)} size="sm" variant="outline">
                      {showSqlScript ? "Hide" : "Show"} SQL Script
                    </Button>
                    <Button onClick={recheckTables} size="sm" className="bg-red-600 hover:bg-red-700">
                      Recheck Tables
                    </Button>
                  </div>
                </div>

                {showSqlScript && (
                  <div className="space-y-3">
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{sqlScript}</pre>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-red-700">
                        1. Go to your Supabase Dashboard → SQL Editor
                        <br />
                        2. Paste and run the above SQL script
                        <br />
                        3. Click "Recheck Tables" after running the script
                      </p>
                      <Button onClick={copySqlScript} size="sm" variant="outline">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy SQL
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Create Social Media Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter post title"
                />
              </div>
              <div>
                
<Label htmlFor="videoUrl" className="text-sm font-medium">
  ভিডিও URL (যেমনঃ https://example.com/video.mp4)
</Label>
<Input
  id="videoUrl"
  placeholder="https://example.com/video.mp4"
  value={formData.videoUrl}
  onChange={(e) =>
    setFormData({ ...formData, videoUrl: e.target.value })
  }
/>
<Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter post description"
                  rows={3}
                  className="resize-y min-h-[80px]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="embedCode">Embed Code (YouTube, TikTok, Instagram iframe or other)</Label>
              <Textarea
                id="embedCode"
                value={formData.embedCode}
                onChange={(e) => handleInputChange("embedCode", e.target.value)}
                placeholder="Paste your embed code here (iframe, script, etc.)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="mediaUpload">Image/Video Upload</Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  id="mediaUpload"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Uploading..." : "Choose File"}
                </Button>
              </div>
              {formData.mediaUrl && (
                <p className="text-sm text-green-600 mt-1">
                  {formData.mediaType === "video" ? "Video" : "Image"} uploaded successfully
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="thumbnailUpload">Custom Thumbnail (Optional)</Label>
              <p className="text-xs text-gray-500 mb-2">
                Upload a custom thumbnail image. If not provided, default thumbnail will be used.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  ref={thumbnailInputRef}
                  id="thumbnailUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={isThumbnailUploading}
                  className="w-full"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {isThumbnailUploading ? "Uploading..." : "Choose Thumbnail"}
                </Button>
              </div>
              {formData.thumbnailUrl && (
                <div className="mt-2">
                  <p className="text-sm text-green-600 mb-2">Custom thumbnail uploaded successfully</p>
                  <img
                    src={formData.thumbnailUrl || "/placeholder.svg"}
                    alt="Custom thumbnail preview"
                    className="w-32 h-20 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="redirectLink">Redirect Link (Skip Ad button)</Label>
              <Input
                id="redirectLink"
                value={formData.redirectLink}
                onChange={(e) => handleInputChange("redirectLink", e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="popunderAd">Popunder Ad Code</Label>
              <Textarea
                id="popunderAd"
                value={formData.popunderAd}
                onChange={(e) => handleInputChange("popunderAd", e.target.value)}
                placeholder="Paste your popunder ad code here"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={generateLink} disabled={isGenerating || tablesExist === false} className="flex-1">
                <LinkIcon className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Link"}
              </Button>
              <Button onClick={clearForm} variant="outline" className="flex-1 bg-transparent">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Form
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Link History Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Link History</CardTitle>
            <p className="text-sm text-gray-600">
              {tablesExist === false
                ? "Database setup required to view link history"
                : linkHistory.length > 0
                  ? "Your generated links will appear here"
                  : "No links generated yet. Create your first link above!"}
            </p>
          </CardHeader>
          <CardContent>
            {tablesExist === false ? (
              <div className="text-center py-8">
                <div className="text-red-400 mb-2">
                  <Database className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500">Database setup required</p>
                <p className="text-sm text-gray-400">Run the SQL script above to create the required tables</p>
              </div>
            ) : linkHistory.length > 0 ? (
              <div className="space-y-3">
                {linkHistory.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate mb-1">{link.title}</p>
                      <p className="text-sm text-blue-600 truncate mb-2 font-mono">
                        {window.location.origin}/post/{link.link_id}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created:{" "}
                        {new Date(link.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(link.link_id)}
                        className="flex items-center gap-1"
                      >
                        {copiedId === link.link_id ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteLink(link.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <LinkIcon className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500">No links generated yet</p>
                <p className="text-sm text-gray-400">
                  Fill out the form above and click "Generate Link" to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
