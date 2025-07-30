import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getBestThumbnail } from "@/lib/cloudinary"
import PostView from "@/components/post-view"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ linkId: string }>
}

async function getPostData(linkId: string) {
  const { data: linkData, error: linkError } = await supabase
    .from("generated_links")
    .select(`
      *,
      posts (*)
    `)
    .eq("link_id", linkId)
    .single()

  if (linkError || !linkData) {
    return null
  }

  return {
    link: linkData,
    post: linkData.posts,
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { linkId } = await params
  const data = await getPostData(linkId)

  if (!data) {
    return {
      title: "Post Not Found",
      description: "The requested post could not be found.",
    }
  }

  const { post } = data

  // Enhanced title and description handling
  const title = post.title?.trim() || post.description?.trim() || "Amazing Social Media Content"
  const description =
    post.description?.trim() || post.title?.trim() || "Check out this amazing content! Don't miss this viral post."

  // Enhanced thumbnail selection with fallback
  const thumbnail = getBestThumbnail(post) || "/placeholder.svg?height=630&width=1200&text=Social+Media+Post"

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com"
  const postUrl = `${siteUrl}/post/${linkId}`

  return {
    title: title,
    description: description,
    keywords: ["social media", "viral content", "entertainment", "video", "streaming", "cricket", "sports"],
    authors: [{ name: "TruthVibe" }],
    creator: "TruthVibe",
    publisher: "TruthVibe",

    // Enhanced Open Graph tags
    openGraph: {
      title: title,
      description: description,
      url: postUrl,
      siteName: "TruthVibe - Social Media Hub",
      type: "article",
      locale: "en_US",
      images: [
        {
          url: thumbnail,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/jpeg",
        },
        // Add multiple image sizes for better compatibility
        {
          url: thumbnail,
          width: 800,
          height: 600,
          alt: title,
          type: "image/jpeg",
        },
        {
          url: thumbnail,
          width: 400,
          height: 300,
          alt: title,
          type: "image/jpeg",
        },
      ],
    },

    // Enhanced Twitter Card tags
    twitter: {
      card: "summary_large_image",
      site: "@TruthVibe",
      creator: "@TruthVibe",
      title: title,
      description: description,
      images: [
        {
          url: thumbnail,
          alt: title,
          width: 1200,
          height: 630,
        },
      ],
    },

    // Additional meta tags for better social sharing
    other: {
      // Facebook specific
      "og:image": thumbnail,
      "og:image:secure_url": thumbnail,
      "og:image:type": "image/jpeg",
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:alt": title,

      // Twitter specific
      "twitter:image": thumbnail,
      "twitter:image:alt": title,
      "twitter:image:width": "1200",
      "twitter:image:height": "630",

      // WhatsApp and Telegram
      "og:title": title,
      "og:description": description,

      // Additional social platforms
      "article:author": "TruthVibe",
      "article:published_time": post.created_at,
      "article:section": "Entertainment",
      "article:tag": "viral, social media, entertainment",

      // Schema.org
      "og:type": "article",
      "og:locale": "en_US",
      "og:site_name": "TruthVibe",

      // Mobile app deep linking
      "al:web:url": postUrl,
      "al:android:url": postUrl,
      "al:ios:url": postUrl,
    },

    // Robots and indexing
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // Verification tags
    verification: {
      google: process.env.GOOGLE_VERIFICATION || "",
      yandex: process.env.YANDEX_VERIFICATION || "",
      yahoo: process.env.YAHOO_VERIFICATION || "",
    },
  }
}

export default async function PostPage({ params }: PageProps) {
  const { linkId } = await params
  const data = await getPostData(linkId)

  if (!data) {
    notFound()
  }

  const { post } = data
  const title = post.title?.trim() || post.description?.trim() || "Amazing Social Media Content"
  const description = post.description?.trim() || post.title?.trim() || "Check out this amazing content!"
  const thumbnail = getBestThumbnail(post) || "/placeholder.svg?height=630&width=1200&text=Social+Media+Post"
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com"
  const postUrl = `${siteUrl}/post/${linkId}`

  return (
    <>
      {/* Enhanced structured data for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: description,
            image: [thumbnail],
            author: {
              "@type": "Organization",
              name: "TruthVibe",
              url: siteUrl,
            },
            publisher: {
              "@type": "Organization",
              name: "TruthVibe",
              logo: {
                "@type": "ImageObject",
                url: `${siteUrl}/logo.png`,
                width: 200,
                height: 60,
              },
            },
            datePublished: post.created_at,
            dateModified: post.created_at,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": postUrl,
            },
            articleSection: "Entertainment",
            keywords: "viral, social media, entertainment, video, streaming",
          }),
        }}
      />

      {/* Additional meta tags in head */}
      <head>
        <meta property="og:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={title} />
        <meta name="twitter:image" content={thumbnail} />
        <meta name="twitter:image:alt" content={title} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={postUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="TruthVibe" />
        <link rel="canonical" href={postUrl} />
      </head>

      <PostView post={data.post} />
    </>
  )
}
