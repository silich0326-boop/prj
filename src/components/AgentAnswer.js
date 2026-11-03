import { Children, createElement as h } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function safeSourceUrl(value) {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''
  } catch { return '' }
}
function SourceLink({ href, children }) {
  const url = safeSourceUrl(href)
  if (!url) return h('span', null, children)
  const label = Children.toArray(children).join('')
  const content = /^https?:\/\//i.test(label)
    ? '출처 보기 · ' + new URL(url).hostname.replace(/^www\./, '')
    : children
  return h('a', { href: url, target: '_blank', rel: 'noopener noreferrer', title: url }, content)
}
const heading = ({children}) => h('h3', null, children)
const components = {
  a: SourceLink,
  h1: heading, h2: heading, h3: heading, h4: heading, h5: heading, h6: heading,
  table: ({children}) => h('div', {className:'answer-table'}, h('table', null, children)),
}
export default function AgentAnswer({ text }) {
  return h('div', { className: 'agent-answer' }, h(Markdown, {
    remarkPlugins: [[remarkGfm,{singleTilde:false}]], components, skipHtml: true,
    disallowedElements: ['img', 'input'], unwrapDisallowed: true,
    urlTransform: safeSourceUrl,
  }, text || ''))
}
