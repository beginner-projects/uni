import { Element } from '@cloudflare/workers-types'

type MetaTagInjectorInput = {
  title: any
  image: any
  url: any
}

export class MetaTagInjector {
  constructor(private input: MetaTagInjectorInput) {}

  element(element: Element) {
    //Open Graph Tags
    element.append(`<meta property="og:title" content="${this.input.title}"/>`, {
      html: true,
    })
    element.append(`<meta property="og:image" content="${this.input.image}"/>`, {
      html: true,
    })
    element.append(`<meta property="og:image:width" content="1200"/>`, {
      html: true,
    })
    element.append(`<meta property="og:image:height" content="630"/>`, {
      html: true,
    })
    element.append('<meta property="og:type" content="website"/>', {
      html: true,
    })
    element.append(`<meta property="og:url" content="${this.input.url}"/>`, {
      html: true,
    })
    element.append(`<meta property="og:image:alt" content="https://app.uniswap.org/images/512x512_App_Icon.png"/>`, {
      html: true,
    })
    //Twitter Tags
    element.append(`<meta property="twitter:card" content="summary_large_image"/>`, {
      html: true,
    })
    element.append(`<meta property="twitter:title" content="${this.input.title}"/>`, {
      html: true,
    })
    element.append(`<meta property="twitter:image" content="${this.input.image}"/>`, {
      html: true,
    })
    element.append(
      `<meta property="twitter:image:alt" content="https://app.uniswap.org/images/512x512_App_Icon.png"/>`,
      {
        html: true,
      }
    )
  }
}
