# junior-webpack-vue
Build vue project via webpack v5

## Vue loader
使用 webpack loader 将 `<template>` 和 `<style>` 中引用的资源当作模块依赖进行处理。

```shell
npm install --save-dev vue-loader vue-template-compiler
```

`vue-template-compiler` 与 `vue` 的版本是一一对应的关系，当升级 `vue` 包时 `vue-template-compiler` 也需要更新。

### vue-template-compiler

把 vue2.0 的 template 预编译为 render 函数，避免运行时编译的开销和 CSP (内容安全策略)限制。大多数情况下需要配合 vue-loader 使用，当你为特定的需求编写构建工具可以将 vue-template-compiler 单独使用。

```js
compiler.compile(template[,options])
```

编译传入的 template string 并且返回编译后的 js 代码。

### vue-loader

1. vue-loader 使用 @vue/component-compiler-utils 将 SFC 源码解析为 SFC 描述器，然后为每个语言块生成一个 import；
2. 想要对每个语言块使用 webpack 配置好的 loader，这时候需要使用 `VueLoaderPlugin`；
3. **使用 vue-loader 把特定语言块中的内容提取出来，传递给需要转译的 loader**；
4. 对于 script 的处理已经足够，对 template 和 style 还需要额外的处理：
   - 对 template 还需要使用 vue-template-compiler
   - 对 `<style scoped>` 在 css-loader 之前进行处理

在扩展的 chain 上会额外注入 `templateLoader` 和 `stylePostLoader`，终端用户配置这些是十分复杂的，所以 `VueLoaderPlugin` 提供了 `pitch loader` 帮助注入其他 loader。

```js
// @vue/component-compiler-utils 为不同的语言块生成的 import

// <template>
import render from 'source.vue?vue&type=template'

// <script>
import script from 'source.vue?vue&type=script'
export * from 'source.vue?vue&type=script'
// <style>
import 'source.vue?vue&type=style&index=1'

script.render = render
export default script
```

```js
// 使用內联 loader 的方式对模块进行处理
import script from 'babel-loader!vue-loader!source.vue?vue&type=script'
import 'style-loader!css-loader!vue-loader!source.vue?vue&type=style&index=1'
```

```js
// 对 template 和 style 添加额外的处理
// 如果使用 <template lang="pug">
import 'vue-loader/template-loader!pug-loader!vue-loader!source.vue?vue&type=template'

// <style lang="scss">
import 'style-loader!css-loader!vue-loader/style-post-loader!sass-loader!vue-loader!source.vue?vue&type=style&index=1&scoped&lang=scss'
```

### css-loader

`css-loader` 把 CSS 块中的 `@import` 和 `url()` 转换为 `import/require()` 引入（配合 webpack 吗？），然后 resolve them。

> 将 css 模块中的资源 URL 转换为 webpack 的模块请求。

把 CSS 提取为一个单独的文件（不把 css 代码写进 js 中），

### vue-style-loader

fork based on style-loader，在 css-loader 转换后在使用，用处是通过 style tag 把 css 代码注入到 document 中。

### postcss-loader

`<style scoped>` 只作用于**当前组件中**的元素，这是借助 postcss 实现的。

- 子组件的根节点会受到父组件 scoped CSS 的影响。
- 深度作用选择器：`>>>`、`/deep/`、`::v-deep` 。
- 动态生成的内容 `v-html`：不受 scoped 的影响。

> - scoped 样式不能完全代替 class：`<style scoped>p {color: red}</style>` 会带来性能上的影响，建议使用：`<style scoped>.title{}</style>`
> - 注意递归组件的影响

### 热重载

热重载会在 `webpack-dev-server --hot` 时自动开启。

