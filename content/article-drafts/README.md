# Article review snapshots

This folder preserves ten new articles and the latest visual revisions of the original five. It contains article Markdown, display metadata, image assignments and short cover text. Image files live in `public/images/editorial/`.

These are unapproved snapshots: `status: "draft"`, `publish: false`. Production reads only `content/articles/catalog.json`, which still contains the original five approved articles. This folder is not imported into the production catalog, search or sitemap. Committing it does not publish its articles.

To view all fifteen locally after installing the repository dependencies:

```sh
node scripts/preview-articles.mjs content/article-drafts
```

This uses the existing development-only preview on localhost port 3100. Stop another preview on that port first. Hosted builds cannot enable that preview mode.

Private review reports, approval records, internal provenance and generation logs are not included. Final publication continues through the existing editorial workspace and approved-content export.

The October 20 visual revision adds unique covers/body images, object imagery and illustrations, four explanatory graphics, cover text on all fifteen articles, Wegovy/Zepbound context on the comparison, and an authentic Lilly developer badge on retatrutide. Cover overlays render as page text; raw and sharing image files remain uncomposited. Desktop and image-delivery checks passed; phone-width visual review is still pending.
