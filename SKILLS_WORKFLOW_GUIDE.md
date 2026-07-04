# HyperFrames Skills & Workflow Guide

Tai lieu nay tom tat cac skill trong `D:\hyperframes\skills`, chuc nang cua tung folder, khi nao nen dung, va workflow chuan de tao video chat luong cao cho dang TikTok/faceless tu file voice `.mp3` co san.

> Trang thai: ban nhap cho user review. Neu co diem chua dung voi cach lam mong muon, sua tai lieu nay truoc khi dung lam workflow chinh.

## 1. Nguyen tac tong quat

HyperFrames la framework render video tu HTML. Mot video tot khong chi la HTML + text animation. Workflow dung nen gom:

1. Hieu input va route dung skill.
2. Transcribe voice bang Whisper dung ngon ngu, lay timestamp tung word.
3. Lap storyboard theo voice, scene khong dung yen qua lau.
4. Dung asset that khi noi ve brand/san pham/tin tuc.
5. Them BGM/SFX hop ly bang `hyperframes-media` hoac `media-use`.
6. Build modular composition, moi scene la sub-composition rieng.
7. Validate bang `lint`, `validate`, `inspect`, `snapshot`.
8. Preview/duyet truoc khi render final.
9. Render high quality va verify bang `ffprobe`.

Nhung loi can tranh:

- Tao component gia thay cho logo/anh/screenshot that.
- Chi co visual, khong co BGM/SFX nen video giong slide HTML.
- Caption khong sync voi voice.
- Scene keo dai qua 8s hoac dung yen qua 5s sau khi noi dung hien het.
- Render khi chua snapshot kiem tra tung scene.
- De text mau toi tren nen toi, khong dat WCAG contrast.

## 2. Ban do skill folders

| Folder | Vai tro ngan gon | Khi nao dung | Output/ket qua mong doi |
| --- | --- | --- | --- |
| `hyperframes` | Skill route dau vao | Bat dau moi request tao/chinh/render video | Chon workflow dung: product, website, faceless, captions, motion, general... |
| `hyperframes-core` | Contract ky thuat composition | Truoc khi viet/sua HTML composition | Cau truc `index.html`, `data-*`, tracks, sub-compositions, media playback dung chuan |
| `hyperframes-animation` | Motion/animation knowledge | Khi can GSAP/Anime/Lottie/Three.js/CSS/WAAPI/scene transitions | Timeline seek-safe, animation co rhythm, khong bi freeze |
| `hyperframes-creative` | Art direction va design system | Truoc khi chon style, palette, typography, beat direction | `DESIGN.md`, `frame.md`, visual direction, pacing, composition density |
| `hyperframes-media` | Voice, BGM, SFX, transcription, captions | Khi can voiceover, Whisper, caption, BGM, SFX, remove background | `audio_meta.json`, assets voice/bgm/sfx, transcript, caption timing |
| `hyperframes-cli` | Dev loop CLI | Khi chay init/lint/validate/inspect/snapshot/preview/render | Du an duoc test va render dung quy trinh |
| `hyperframes-registry` | Cai block/component co san | Khi can `hyperframes add`, caption components, registry block | Component/block duoc cai va wire vao composition |
| `media-use` | Resolve media asset thanh file local | Khi can BGM/SFX/image/icon co manifest | `.media/manifest.jsonl`, `.media/index.md`, asset frozen local |
| `general-video` | Workflow fallback | Video custom khong thuoc workflow chuyen biet | Project HyperFrames tu do, multi-scene/custom format |
| `faceless-explainer` | Video giai thich faceless tu text | Topic/article/notes/brief, khong URL/khong footage | Video explainer voi typography/abstract/diagram/data-viz |
| `product-launch-video` | Promo/product launch | URL/brief/script de quang ba product/SaaS/app/company | Product launch video, co marketing arc |
| `website-to-video` | Video tu website that | Site tour/showcase/social clip tu screenshot + asset site | Video gioi thieu website, khong phai product promo |
| `motion-graphics` | Motion graphic ngan | Logo sting, lower-third, kinetic type, stat/chart/headline | MP4/overlay ngan, motion la thong diep chinh |
| `music-to-video` | Beat-synced video | Audio/music track dieu khien pacing | Visualizer/lyric/slideshow/kinetic promo theo beat |
| `embedded-captions` | Them captions vao talking-head video | Video co nguoi noi can subtitle/cinematic captions | Footage goc giu nguyen, caption overlay/matte |
| `talking-head-recut` | Graphic overlay cho talking-head | Interview/podcast/talk can lower-third/callout/quote card | Video goc + timed graphic cards |
| `pr-to-video` | Video tu GitHub PR | PR URL/ref, changelog/feature/fix/refactor | Code-change explainer tu diff/commits |
| `slideshow` | Deck/slideshow interactive | Pitch deck, slide deck, presentation | HyperFrames slideshow co navigation/fragment |
| `remotion-to-hyperframes` | Port Remotion sang HyperFrames | Chi khi user yeu cau convert/migrate Remotion source | HTML composition tu Remotion, co validation/diff |

## 3. Chi tiet tung skill

### 3.1 `hyperframes`

- La router trung tam.
- Dung dau tien cho moi viec lien quan video/animation/render.
- Khong truc tiep build video; no quyet dinh workflow nao phu hop.
- Neu input la MP3 voice + faceless TikTok nhu project hien tai: route gan nhat la `general-video` ket hop `hyperframes-media`, `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `media-use`.

### 3.2 `hyperframes-core`

Dung de dam bao composition render duoc va deterministic.

Quy tac quan trong:

- Top-level `index.html` co root `data-composition-id`, `data-duration`, `data-width`, `data-height`.
- Sub-composition phai boc trong `<template>`.
- Host `data-composition-id` phai trung voi inner root va `window.__timelines["id"]`.
- Moi composition co mot paused timeline: `gsap.timeline({ paused: true })`.
- Audio/video nen la child truc tiep cua root/host, de framework quan ly playback.
- Khong dung `Date.now()`, random khong seed, network fetch luc render.
- Khong animate `display`/`visibility` bang tween.
- Full-screen background nen nam tren child full-bleed, khong dat background truc tiep tren root.

Dung khi:

- Tao `index.html`.
- Tach scene thanh `compositions/sXX-name.html`.
- Them audio/caption/sub-composition.
- Sua loi timeline/subcomp missing.

### 3.3 `hyperframes-animation`

Dung cho motion design.

No bao gom:

- Atomic motion rules.
- Multi-phase scene blueprints.
- Scene transitions.
- Runtime adapters: GSAP mac dinh, Lottie, Three.js, Anime.js, CSS keyframes, Web Animations API, TypeGPU.

Quy tac nen ap dung cho TikTok faceless:

- Moi scene phai co motion sau entrance, khong chi vao roi dung yen.
- Component can co lifecycle: enter -> develop -> emphasis -> exit.
- Scene transition nen co sound cue neu co SFX.
- Text reveal nen sync voi voice/caption group.
- Scene khong qua 8s; sau khi full content hien het khong dung yen qua 5s.

### 3.4 `hyperframes-creative`

Dung cho chat luong nghe thuat.

Nen doc/tao:

- `DESIGN.md` hoac `frame.md`: palette, typography, style, constraints.
- Beat direction: moi scene co mot y tuong, mot visual metaphor, mot motion role.
- Video composition: 9:16 can density cao hon web page, foreground co metadata/labels/register marks/data bars.

Quy tac chat luong:

- Khong dung mot palette don dieu ca video.
- Khong tao UI card gia neu co the dung anh/logo/screenshot that.
- Can co visual hierarchy ro: hook, headline, caption, support visual.
- Chu TikTok phai doc duoc tren mobile nho.

### 3.5 `hyperframes-media`

Day la skill rat quan trong ma ban video truoc chua tan dung du.

Chuc nang:

- TTS/voiceover qua HeyGen, ElevenLabs, Kokoro local.
- Whisper transcription.
- Word-level captions.
- BGM.
- SFX.
- Background removal.

#### Audio engine

Skill dung chung mot engine:

```bash
node skills/hyperframes-media/scripts/audio.mjs --request audio_request.json --out audio_meta.json --project .
```

Khong nen tu viet engine audio rieng neu workflow can TTS/BGM/SFX.

#### Preflight auth

Truoc khi generate voice/BGM/SFX online:

```bash
npx hyperframes auth status
```

Neu chua sign in, workflow dung chuan la bao user va cho user chon:

- sign in de dung HeyGen retrieval/TTS, hoac
- tiep tuc offline/local.

#### BGM

BGM co hai route:

- Co credential: retrieve nhac tu HeyGen music catalog theo mood/query.
- Khong credential: local generation Lyria -> MusicGen neu moi truong ho tro.

BGM output thuong vao:

```text
assets/bgm/track.mp3
assets/bgm/track.wav
```

Volume guideline:

- Co narration: BGM khoang `0.8` trong metadata, nhung khi mix thuc te can nghe lai; TikTok voice nen uu tien voice ro.
- Khong narration: BGM co the cao hon.

#### SFX

SFX co hai route:

- Co credential: search HeyGen sound-effects catalog.
- Khong credential: dung bundled local library trong `skills/hyperframes-media/assets/sfx`.

Bundled SFX hien co:

- `chime.mp3`
- `click.mp3`
- `click-soft.mp3`
- `error.mp3`
- `glitch-1.mp3`
- `glitch-2.mp3`
- `glitch-3.mp3`
- `impact-bass-1.mp3`
- `impact-bass-2.mp3`
- `key-press.mp3`
- `notification.mp3`
- `ping.mp3`
- `pop.mp3`
- `riser.mp3`
- `sparkle.mp3`
- `typing.mp3`
- `whoosh.mp3`
- `whoosh-cinematic.mp3`
- `whoosh-short.mp3`

Quy tac SFX:

- Volume mac dinh khoang `0.35`, nam duoi voice + BGM.
- Cue phai cu the: `whoosh`, `impact-bass-1`, `glitch-2`, `typing`, khong nen `dramatic sound`.
- SFX khong match thi skip, khong block render.
- Dung SFX cho:
  - Scene transition: `whoosh-short`, `whoosh-cinematic`.
  - Hook/headline punch: `impact-bass-1`, `impact-bass-2`.
  - Tech glitch/filter/lock: `glitch-1/2/3`, `error`.
  - UI/payment/route: `click`, `click-soft`, `key-press`.
  - CTA/notification: `ping`, `notification`, `chime`.
  - Build-up truoc cao trao: `riser`.

#### Captions

Caption rules quan trong:

- Transcript phai dung ngon ngu. CLI default `small.en` co the dich/sai voi audio khong phai English.
- Can word-level timestamps.
- Word grouping:
  - High energy: 2-3 words.
  - Conversational: 3-5 words.
  - Calm: 4-6 words.
- Break theo sentence boundary, pause >=150ms, hoac max word count.
- Mot caption group visible tai mot thoi diem.
- Moi group phai co hard kill o `group.end`.
- Position cho portrait: lower-middle, nhung tranh khu vuc UI/caption TikTok va khong che noi dung chinh.
- Dung `fitTextFontSize()` de tranh overflow.

### 3.6 `hyperframes-cli`

Command workflow chuan:

```bash
npx hyperframes lint
npx hyperframes validate
npx hyperframes inspect
npx hyperframes snapshot --at <midpoints>
npx hyperframes preview
npx hyperframes render --quality high --output renders/final.mp4
```

Luu y:

- `lint`: bat loi structure/static.
- `validate`: load Chrome, bat console error + contrast.
- `inspect`: bat overflow/layout/occlusion.
- `snapshot`: bat loi cross-file sub-composition ma static gate khong bat.
- `preview`: dung cho user review/edit.
- `render`: chi nen lam sau khi user approve.
- Sau render phai verify file ton tai va `ffprobe` duration/size.

### 3.7 `hyperframes-registry`

Dung khi can cai block/component co san.

Vi du caption components:

```bash
npx hyperframes catalog --tag caption-style
npx hyperframes add caption-highlight
```

Nen dung registry khi:

- Can caption style co san thay vi tu code lai.
- Can chart/data block.
- Can effect component co san.
- Muon giam rui ro component tu che kem chat luong.

### 3.8 `media-use`

Dung de resolve asset thanh local file co manifest.

Lenh mau:

```bash
node skills/media-use/scripts/resolve.mjs --type image --intent "Claude AI product interface" --project .
node skills/media-use/scripts/resolve.mjs --type icon --intent "warning lock" --project .
node skills/media-use/scripts/resolve.mjs --type sfx --intent "whoosh" --project .
node skills/media-use/scripts/resolve.mjs --adopt --project .
```

File quan trong:

- `.media/manifest.jsonl`: source of truth cho asset.
- `.media/index.md`: inventory de agent/doc doc lai.
- `assets/images/SOURCES.md`: nen tao them neu tu download bang web.

Nguyen tac asset that:

- Logo/cong ty/san pham: uu tien official/press/Wikimedia/source ro.
- Screenshot: uu tien capture official webpage/product UI neu phu hop.
- Tin tuc/headline: dung source ro, khong copy bai dai, chi dung visual/card/short quote neu duoc phep.
- Moi asset download can luu local va ghi nguon.

### 3.9 `faceless-explainer`

Dung cho topic explainer khong co footage/URL.

Phu hop:

- Explainer tu text/article/notes.
- Visual duoc tao bang typography, abstract graphics, diagrams, data-viz.

Khong phu hop neu:

- Can anh/screenshot that cua product/site.
- Can quang ba product.
- Co source video talking-head.

Voi video cua ban, do noi ve tin/brand AI va can asset that, nen khong nen dung faceless-explainer thuay tuy. Nen dung `general-video` + `media-use` + `hyperframes-media`.

### 3.10 `product-launch-video`

Dung khi video co muc tieu marketing product.

Workflow co the gom:

- Capture product URL.
- Extract brand tokens.
- Viet `DESIGN.md`/`frame.md`.
- Storyboard/script.
- Audio/captions/BGM/SFX.
- Build frames.
- Validate/snapshot/preview/render.

Khong dung cho video tin tuc/tranh luan AI neu khong phai promote san pham.

### 3.11 `website-to-video`

Dung khi can video tu website that.

No bat buoc tap trung vao site visuals:

- Screenshot.
- Brand assets.
- Design tokens.
- Site tour/showcase.

Khong dung cho product promo neu muc tieu la ban hang; luc do dung `product-launch-video`.

### 3.12 `motion-graphics`

Dung cho doan ngan motion-first:

- Logo sting.
- Animated headline.
- Stat count-up.
- Lower-third.
- Social overlay.

Neu video co narration 1-2 phut, multi-scene, can story arc thi khong dung skill nay lam workflow chinh. Co the dung motion principles cua no cho tung scene ngan.

### 3.13 `music-to-video`

Dung khi input chinh la music track.

Khong phai workflow chinh cho voiceover news video, vi o day voice noi moi la driver. Tuy nhien co the muon audio-reactive visuals thi lay y tuong beat/energy map tu skill nay.

### 3.14 `embedded-captions`

Dung cho video co footage nguoi noi va can caption/subtitle.

Khong phu hop cho faceless video tu MP3, vi khong co footage talking-head. Nhung cac rule caption cua no van huu ich:

- Word timing phai lech duoi 80ms.
- Khong overlap caption groups.
- Caption phai doc duoc, khong che text/face.
- Moi caption >=0.5s neu can doc.

### 3.15 `talking-head-recut`

Dung khi co video nguoi noi va muon them graphic overlays.

Khong dung cho video tu MP3/faceless. Nhung concept overlay card/lower-third/callout co the ap dung lai cho faceless scene.

### 3.16 `pr-to-video`

Dung rieng cho GitHub PR. Khong lien quan project TikTok AI news hien tai, tru khi video ve code change/PR.

### 3.17 `slideshow`

Dung de tao presentation/deck co navigation, khong phai rendered TikTok MP4. Khong dung cho video TikTok final.

### 3.18 `remotion-to-hyperframes`

Chi dung khi user co source Remotion va yeu cau port sang HyperFrames. Khong dung khi Remotion chi la reference style.

## 4. Workflow chuan de tao video TikTok faceless tu MP3

Day la workflow de ap dung cho cac video giong `videos/ai-news-claude-fable-5-remake`.

### Phase 0 - Intake va audit

Input can co:

- File voice `.mp3`.
- Neu co: video mau/reference trong `Sources`.
- Neu co: design rules/suggest-design.
- Chu de, platform: TikTok/Reels/Shorts.
- Muc tieu: news, drama, explainer, reaction, CTA.

Can tao/check:

```text
PROJECT/
  index.html
  DESIGN.md
  STORYBOARD.md
  assets/
    narration.mp3
    words.json
    captions.json
    images/
    sfx/
    bgm/
  compositions/
  renders/
  snapshots/
```

Gate:

- Xac dinh duration audio bang `ffprobe`.
- Xac dinh canvas: TikTok portrait `1080x1920`.
- Xac dinh target style tu reference.

### Phase 1 - Transcription va caption source

Dung Whisper/hyperframes transcribe de lay word timestamp.

Yeu cau:

- Dung model/ngon ngu phu hop tieng Viet/English mix.
- Output can co word-level `{ text, start, end }`.
- Sanity-read transcript, sua loi ten brand: Claude, Anthropic, OpenAI, Fable, Opus...
- Tao `words.json` va caption groups.

Gate:

- Voice va caption text phai khop noi dung.
- Khong co word timestamp gia/tu doan.
- Sai brand name phai sua truoc khi build scene.

### Phase 2 - Storyboard theo voice

Scene rules:

- Moi scene <= 8s.
- Sau khi full content hien het, khong dung yen > 5s.
- Moi scene co mot y tuong chinh.
- Moi scene co visual action, khong chi text.
- Scene midpoint dung de snapshot.

`STORYBOARD.md` nen co bang:

```md
| id | time | role | headline | voice span | visual asset | motion | sfx |
| --- | --- | --- | --- | --- | --- | --- | --- |
| s01-hook | 0.00-7.20 | hook | ... | words 0-18 | Claude logo | punch reveal | impact-bass, glitch |
```

Gate:

- Tong scene cover dung duration MP3.
- Khong co khoang trong khong visual.
- Scene changes khop voi voice beats.

### Phase 3 - Design direction

Tao `DESIGN.md` hoac `frame.md`.

Can co:

- Palette.
- Font policy.
- Caption style.
- Safe zones TikTok.
- Asset policy.
- Motion language.
- SFX/BGM mood.

Quy tac:

- Mau text phai du contrast.
- Khong dung font khong co local/Google/bundled support.
- Neu dung Vietnamese, test dau tieng Viet ky.
- Khong de subtitle sat day man hinh.

### Phase 4 - Asset that

Dung `media-use` va/hoac web download co source.

Asset candidates:

- Logo Claude/Anthropic/OpenAI.
- Screenshot UI/san pham neu noi ve product.
- News/social cards neu co source hop ly.
- Icons: lock, filter, warning, money, route.
- Background texture/abstract neu khong can factual.

Rules:

- Luu vao `assets/images`.
- Ghi `assets/images/SOURCES.md`.
- Neu asset tu web, uu tien official/Wikimedia/press/public domain.
- Khong hotlink trong render; phai local file.

Gate:

- `npx hyperframes lint` khong co `missing_local_asset`.
- Snapshot hien asset dung, khong blank/404.

### Phase 5 - Audio design: BGM + SFX

Dung `hyperframes-media`.

#### BGM plan

Voi news/drama AI TikTok:

- Mood: dark tech, tense pulse, restrained cinematic, low volume.
- BGM khong lan voice.
- Loop/trim dung duration.

Neu dung engine:

```bash
npx hyperframes auth status
node skills/hyperframes-media/scripts/audio.mjs --request audio_request.json --out audio_meta.json --project .
```

Neu offline, co the dung local generated/skipped tuy moi truong.

#### SFX plan

Nen tao cue theo scene:

| Moment | Suggested SFX |
| --- | --- |
| Hook title hit | `impact-bass-1`, `glitch-1` |
| Scene transition | `whoosh-short` |
| Model/filter/locked | `glitch-2`, `error` |
| Payment/pro users/quota | `click`, `notification` |
| Route/fallback | `whoosh`, `pop` |
| CTA/comment | `ping`, `chime` |
| Build-up before climax | `riser` |

Volume:

- Voice: 1.0.
- BGM: tuy mix, thuong 0.12-0.25 trong HTML neu dat track rieng; metadata engine co the 0.8 nhung final mix can nghe lai.
- SFX: 0.25-0.4.

Gate:

- BGM/SFX khong che voice.
- SFX dung cue, khong spam moi word.
- Scene transition co sound cue neu visual hit manh.

### Phase 6 - Build modular composition

Kien truc khuyen nghi:

```text
index.html
compositions/
  ambient-bg.html
  captions.html
  s01-hook.html
  s02-...
assets/
  narration.mp3
  images/
  bgm/
  sfx/
```

`index.html` nen mount:

- Ambient background track thap.
- Scene sub-comps track rieng.
- Captions track cao.
- Audio narration direct child.
- BGM/SFX audio tracks neu co.

Moi subcomp:

- Co `<template id="sXX-name-template">`.
- Inner root `data-composition-id="sXX-name"`.
- Timeline key `window.__timelines['sXX-name']`.
- CSS/script nam trong template.
- Khong network fetch luc render.

### Phase 7 - Captions

Caption layer nen la sub-composition rieng.

Rules:

- Sync theo `words.json`/`captions.json`.
- CTA/caption khong sat day qua.
- Avoid overlap voi headline scene.
- Highlight word theo timestamp.
- Vietnamese diacritics phai render dung.
- Font co support Vietnamese.

Gate:

- Sample 5-10 timestamps: voice nghe/word highlight khop.
- Khong co line overlap/clip.
- Caption khong bi che boi TikTok UI safe zone.

### Phase 8 - Validation

Chay truoc preview/render:

```bash
npx hyperframes lint
npx hyperframes validate --timeout 60000
npx hyperframes inspect
npx hyperframes snapshot --no-end --at <scene-midpoints>
```

Can review:

- Text co doc duoc khong.
- Asset co load khong.
- Logo/screenshot co dung kich thuoc khong.
- Caption co nam dung vi tri khong.
- Scene co static qua lau khong.
- Mau co contrast khong.

Neu co sub-composition, snapshot la bat buoc vi lint/validate co the khong bat loi mount cross-file.

### Phase 9 - Preview va user approval

Chay Studio preview:

```bash
npx hyperframes preview --port <free-port>
```

User review:

- Visual style.
- Noi dung voice/caption.
- Text position.
- Scene pacing.
- Asset factual.
- Sound mix.

Khong render final neu user chua approve, tru khi user yeu cau ro.

### Phase 10 - Render final

Neu o D thieu dung luong, render project tam tren C:

```powershell
# copy project to C:\tmp then render there
npx hyperframes render --quality high --output C:\tmp\final.mp4
```

Sau do copy final ve:

```text
renders/final.mp4
```

Verify:

```bash
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1:nokey=0 renders/final.mp4
```

Final response can ghi:

- File path.
- Duration.
- Size.
- Validation done.
- Known warnings neu co.

## 5. Workflow toi uu cho project hien tai

Voi video `ai-news-claude-fable-5-remake`, ban workflow nen la:

1. Read reference `videos/bitsness-arkon` de giu modular architecture.
2. Read `Sources/suggest-design` va `Sources/design-rule` neu user cap nhat.
3. Copy MP3 vao `assets/narration.mp3`.
4. Whisper transcribe word-level -> `assets/words.json`.
5. Build `caption_groups.json` theo phrase 2-5 words.
6. Write `DESIGN.md` voi style TikTok news/cyber editorial.
7. Write `STORYBOARD.md` voi max scene 8s.
8. Download/adopt real assets:
   - Claude/Anthropic/OpenAI logo.
   - Screenshot/source cards neu can.
   - Ghi `assets/images/SOURCES.md`.
9. Build `ambient-bg.html`, `captions.html`, `sXX.html`.
10. Tao audio plan:
    - BGM: dark tech/tense pulse.
    - SFX: impact hook, whoosh transitions, glitch/filter, click/payment, ping CTA.
11. Mount audio tracks vao `index.html`.
12. Run gates: lint -> validate -> inspect -> snapshot midpoints.
13. Preview cho user duyet.
14. Render final high quality.
15. Verify ffprobe.

## 6. Checklist bat buoc truoc khi giao video

### Content

- [ ] Voice va caption noi dung khop nhau.
- [ ] Brand names dung chinh ta.
- [ ] Khong co chu bi loi font/dau tieng Viet.
- [ ] Khong co scene qua 8s.
- [ ] Khong co scene dung yen qua 5s sau khi noi dung hien het.

### Visual

- [ ] Asset that duoc dung cho brand/san pham/tin tuc.
- [ ] Asset co source local.
- [ ] Text contrast tot.
- [ ] Captions khong sat day va khong bi TikTok UI che.
- [ ] Scene nao cung co motion develop.
- [ ] Snapshot moi scene da xem.

### Audio

- [ ] Voice ro, khong bi BGM che.
- [ ] Co BGM neu video can energy.
- [ ] Co SFX tai hook/transition/key reveal.
- [ ] SFX khong qua to, khong spam.
- [ ] Audio duration khop video duration.

### Technical

- [ ] `npx hyperframes lint` 0 errors.
- [ ] `npx hyperframes validate` 0 console errors.
- [ ] `npx hyperframes inspect` khong co layout error nghiem trong.
- [ ] `npx hyperframes snapshot --at <midpoints>` da tao frames.
- [ ] Render final thanh cong.
- [ ] `ffprobe` xac minh duration/size.

## 7. Cac quyet dinh can user duyet

Truoc khi build final, nen hoi/duyet cac diem nay:

1. Co dung BGM khong? Neu co, mood nao: dark tech, urgent news, cinematic tension, upbeat tech?
2. SFX co chap nhan style manh kieu TikTok khong, hay chi subtle?
3. Asset policy: chi official/Wikimedia, hay cho phep screenshot/news/social card co source?
4. Caption style: kinetic word highlight, subtitle rail, hay editorial caption card?
5. Render final hay chi preview truoc?

## 8. Ket luan

Dung skill tot nhat cho video MP3 faceless khong phai mot skill duy nhat, ma la chuoi:

```text
hyperframes
-> general-video
-> hyperframes-core
-> hyperframes-creative
-> hyperframes-animation
-> hyperframes-media
-> media-use
-> hyperframes-cli
```

Neu co product URL thi thay `general-video` bang `product-launch-video` hoac `website-to-video` tuy muc tieu. Neu co footage talking-head thi dung `embedded-captions` hoac `talking-head-recut`.

Workflow moi can coi audio, asset that, caption sync va validation la phan bat buoc, khong phai phan trang tri them sau.