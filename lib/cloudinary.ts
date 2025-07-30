export const uploadToCloudinary = async (file: File): Promise<{ url: string; type: string }> => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", "truthvibe")
  formData.append("cloud_name", "dgrx1vate")

  const isVideo = file.type.startsWith("video/")
  const endpoint = isVideo
    ? "https://api.cloudinary.com/v1_1/dgrx1vate/video/upload"
    : "https://api.cloudinary.com/v1_1/dgrx1vate/image/upload"

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Upload failed")
    }

    const data = await response.json()
    return {
      url: data.secure_url,
      type: isVideo ? "video" : "image",
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw error
  }
}

// Enhanced video ID extraction for multiple platforms
export const extractVideoId = (url: string): { platform: string; videoId: string } | null => {
  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    return { platform: "youtube", videoId: youtubeMatch[1] }
  }

  // TikTok patterns
  const tiktokRegex = /(?:tiktok\.com\/@[^/]+\/video\/|vm\.tiktok\.com\/|tiktok\.com\/t\/)([A-Za-z0-9]+)/
  const tiktokMatch = url.match(tiktokRegex)
  if (tiktokMatch) {
    return { platform: "tiktok", videoId: tiktokMatch[1] }
  }

  // Instagram patterns
  const instagramRegex = /(?:instagram\.com\/(?:p|reel|tv)\/|instagr\.am\/p\/)([A-Za-z0-9_-]+)/
  const instagramMatch = url.match(instagramRegex)
  if (instagramMatch) {
    return { platform: "instagram", videoId: instagramMatch[1] }
  }

  // Vimeo patterns
  const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    return { platform: "vimeo", videoId: vimeoMatch[1] }
  }

  // Facebook patterns
  const facebookRegex = /(?:facebook\.com\/.*\/videos\/|fb\.watch\/)([0-9]+)/
  const facebookMatch = url.match(facebookRegex)
  if (facebookMatch) {
    return { platform: "facebook", videoId: facebookMatch[1] }
  }

  // Twitter patterns
  const twitterRegex = /(?:twitter\.com\/.*\/status\/|x\.com\/.*\/status\/)([0-9]+)/
  const twitterMatch = url.match(twitterRegex)
  if (twitterMatch) {
    return { platform: "twitter", videoId: twitterMatch[1] }
  }

  return null
}

// Legacy function for backward compatibility
export const extractYouTubeVideoId = (embedCode: string): string | null => {
  const regex = /(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
  const match = embedCode.match(regex)
  return match ? match[1] : null
}

export const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

// Enhanced thumbnail generation for multiple platforms
export const getVideoThumbnail = (platform: string, videoId: string): string => {
  switch (platform) {
    case "youtube":
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    case "vimeo":
      return `https://vumbnail.com/${videoId}.jpg`
    case "tiktok":
      return "/placeholder.svg?height=630&width=1200&text=TikTok+Video"
    case "instagram":
      return "/placeholder.svg?height=630&width=1200&text=Instagram+Video"
    case "facebook":
      return "/placeholder.svg?height=630&width=1200&text=Facebook+Video"
    case "twitter":
      return "/placeholder.svg?height=630&width=1200&text=Twitter+Video"
    default:
      return "/placeholder.svg?height=630&width=1200&text=Video+Content"
  }
}

// Function to get the best thumbnail based on priority
export const getBestThumbnail = (post: {
  thumbnail_url?: string | null
  media_url?: string | null
  media_type?: string | null
  embed_code?: string | null
}): string => {
  // Priority 1: Custom thumbnail
  if (post.thumbnail_url) {
    return post.thumbnail_url
  }

  // Priority 2: Uploaded media (if it's an image)
  if (post.media_url && post.media_type === "image") {
    return post.media_url
  }

  // Priority 3: YouTube thumbnail from embed code
  if (post.embed_code) {
    const videoId = extractYouTubeVideoId(post.embed_code)
    if (videoId) {
      return getYouTubeThumbnail(videoId)
    }
  }

  // Priority 4: Video thumbnail (if it's a video)
  if (post.media_url && post.media_type === "video") {
    return post.media_url
  }

  // Fallback: Placeholder
  return "/placeholder.svg?height=630&width=1200&text=Social+Media+Post"
}
