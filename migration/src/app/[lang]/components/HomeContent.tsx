'use client'

import Dialog from '@/components/Dialog'
import VisibilityManager from '@/components/VisibilityManager'
import { useDialog } from '@/context/dialog'
import { MDXRemote } from 'next-mdx-remote'
import { components } from '@/helpers/mdxjs'

type Props = {
  lang: string
  content: {
    desktop: {
      compiledSource: string
    }
    mobile: {
      compiledSource: string
    }
  }
}

const HomeContent = ({ content }: Props) => {
  const { open } = useDialog()

  return (
    <Dialog
      className="home"
      modalMode
      open={open}
      body={
        <>
          <VisibilityManager hideOnDesktop hideOnTablet>
            <MDXRemote {...content.mobile} components={components} frontmatter={undefined} scope={{}} />
          </VisibilityManager>
          <VisibilityManager hideOnMobile>
            <MDXRemote
              {...content.desktop}
              components={components}
              frontmatter={undefined}
              scope={{}}
            />
          </VisibilityManager>
        </>
      }
    />
  )
}

export default HomeContent
