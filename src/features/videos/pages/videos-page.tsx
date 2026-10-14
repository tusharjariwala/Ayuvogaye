import { ArrowLeft, Clock, PlayCircle } from "lucide-react"
import { useEffect } from "react"
import { Link, useParams } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { APP_NAME } from "@/lib/constants"
import NotFoundPage from "@/features/public/pages/not-found-page"

interface Video {
  slug: string
  title: string
  description: string
  duration: string
  /** YouTube video ID (the part after `v=`). Leave empty to show a placeholder. */
  youtubeId?: string
}

const VIDEOS: Video[] = [
  {
    slug: "comparing-hospitals",
    title: "How to compare hospitals side by side",
    description: "A quick walkthrough of the hospital comparison tool.",
    duration: "3:20",
  },
  {
    slug: "video-consultation-tips",
    title: "Tips for your first video consultation",
    description: "What to prepare before an online appointment with a doctor.",
    duration: "4:05",
  },
]

function VideoPlayer({ video }: { video: Video }) {
  if (!video.youtubeId) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border bg-muted text-muted-foreground">
        <PlayCircle className="size-12" aria-hidden="true" />
        <p className="text-sm">Video placeholder — add a YouTube ID</p>
      </div>
    )
  }
  return (
    <iframe
      className="aspect-video w-full rounded-xl border"
      src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
      title={video.title}
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}

export default function VideosPage() {
  const { slug } = useParams()
  const video = slug ? VIDEOS.find((v) => v.slug === slug) : undefined
  const title = video?.title ?? "Videos"

  useEffect(() => {
    const previous = document.title
    document.title = `${title} · ${APP_NAME}`
    return () => {
      document.title = previous
    }
  }, [title])

  if (slug && !video) return <NotFoundPage />

  if (video) {
    return (
      <div className="container-page max-w-4xl space-y-6 py-10">
        <Link to="/videos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" aria-hidden="true" /> All videos
        </Link>
        <VideoPlayer video={video} />
        <PageHeader title={video.title} description={video.description} />
      </div>
    )
  }

  return (
    <div className="container-page space-y-8 py-10">
      <PageHeader
        eyebrow={<p className="text-sm font-medium text-primary">Resources</p>}
        title="Videos"
        description="Short videos to help you find and choose the right care."
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VIDEOS.map((v) => (
          <li key={v.slug}>
            <Card className="h-full gap-0 overflow-hidden py-0 shadow-soft transition-shadow hover:shadow-raised">
              <Link to={`/videos/${v.slug}`} className="block focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">
                  {v.youtubeId ? (
                    <img src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`} alt="" className="size-full object-cover" />
                  ) : (
                    <PlayCircle className="size-10" aria-hidden="true" />
                  )}
                </div>
                <CardContent className="space-y-1.5 p-5">
                  <h2 className="font-semibold">{v.title}</h2>
                  <p className="text-sm text-muted-foreground">{v.description}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden="true" /> {v.duration}
                  </p>
                </CardContent>
              </Link>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
