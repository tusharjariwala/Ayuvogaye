import { ArrowLeft, Calendar } from "lucide-react"
import { useEffect } from "react"
import { Link, useParams } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { APP_NAME } from "@/lib/constants"
import NotFoundPage from "@/features/public/pages/not-found-page"

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  body: string[]
}

const POSTS: BlogPost[] = [
  {
    slug: "how-to-choose-a-hospital",
    title: "How to choose a hospital for a planned procedure",
    excerpt: "Accreditations, specialties and facilities — what to compare before you book.",
    date: "2026-09-12",
    body: [
      "Start by shortlisting hospitals that offer the treatment you need and have doctors in the relevant specialty.",
      "Check accreditations and facilities, then use the comparison tool to see them side by side.",
      "This is sample content — replace it with your own articles.",
    ],
  },
  {
    slug: "preparing-for-a-video-consultation",
    title: "Preparing for a video consultation",
    excerpt: "A short checklist to get the most out of an online appointment.",
    date: "2026-08-28",
    body: [
      "Find a quiet, well-lit spot and test your camera and microphone beforehand.",
      "Keep recent reports and a list of current medicines ready to share.",
      "This is sample content — replace it with your own articles.",
    ],
  },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default function BlogPage() {
  const { slug } = useParams()
  const post = slug ? POSTS.find((p) => p.slug === slug) : undefined
  const title = post?.title ?? "Blog"

  useEffect(() => {
    const previous = document.title
    document.title = `${title} · ${APP_NAME}`
    return () => {
      document.title = previous
    }
  }, [title])

  if (slug && !post) return <NotFoundPage />

  if (post) {
    return (
      <article className="container-page max-w-3xl space-y-6 py-10">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" aria-hidden="true" /> All posts
        </Link>
        <PageHeader
          title={post.title}
          eyebrow={
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="size-4" aria-hidden="true" /> {formatDate(post.date)}
            </p>
          }
        />
        <div className="space-y-4 leading-relaxed">
          {post.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </article>
    )
  }

  return (
    <div className="container-page space-y-8 py-10">
      <PageHeader
        eyebrow={<p className="text-sm font-medium text-primary">Resources</p>}
        title="Blog"
        description="Guides and articles to help you make informed healthcare choices."
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {POSTS.map((p) => (
          <li key={p.slug}>
            <Card className="h-full gap-0 py-0 shadow-soft transition-shadow hover:shadow-raised">
              <CardContent className="space-y-2 p-5">
                <p className="text-xs text-muted-foreground">{formatDate(p.date)}</p>
                <h2 className="font-semibold">
                  <Link to={`/blog/${p.slug}`} className="hover:text-primary hover:underline">
                    {p.title}
                  </Link>
                </h2>
                <p className="text-sm text-muted-foreground">{p.excerpt}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
