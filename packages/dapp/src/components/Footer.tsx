import { css } from '@emotion/react'

export const Footer = () => {
  return (
    <footer css={css`
      height: var(--footer-height);
      border-top: var(--border-black);
      a {
        text-decoration: none;
      }
    `}>
      <a target="_blank" href="https://pr1s0n.art/" className="zora-branding">pr1s0n.art</a>
      <a target="_blank" href="https://pr1s0n.art/#the-solution">our work</a>
    </footer>
  )
}
