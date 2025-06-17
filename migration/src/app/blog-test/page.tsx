import PostContent from '../../../../../data/blog/make-a-views-counter/make-a-views-counter.en.mdx'

export default function BlogPost() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="prose prose-lg dark:prose-invert">
        <PostContent />
      </div>
    </div>
  )
}
