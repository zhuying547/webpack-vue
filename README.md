# junior-webpack-vue
Build vue project via webpack v5

## Vue loader
```shell
npm install --save-dev vue-loader vue-template-compiler
```

下载 `vue-template-compiler` 是为了提前编译模板的，不需要在 runtime 进行编译，节约时间罢了。结果竟然是 vue-loader 会生成兼容运行时的代码。

### vue-template-compiler

把 vue 的 template 预编译为 render 函数，避免运行时编译的开销和 CSP (内容安全策略)限制。大多数情况下需要配合 vue-loader 使用，当你为特定的需求编写构建工具可以将 vue-template-compiler 单独使用。

```js
compiler.compile(template[,options])
```

编译传入的 template string 并且返回编译后的 js 代码。

### VueLoaderPlugin

vue-loader 还提供了 VueLoaderPlugin 这个插件，这货把能应用到 `.vue` 文件中的语言块的 rules 都卡卡西了一遍，就是说我是复制🥷，哥们你只要针对语言块配置就完事了，到时候我直接 copy 过来拿下。

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

// todo postcss-loader 是什么？

`<style scoped>` 只作用于**当前组件中**的元素，这是借助 postcss 实现的。

- 子组件的根节点会受到父组件 scoped CSS 的影响。
- 深度作用选择器：`>>>`、`/deep/`、`::v-deep` 。
- 动态生成的内容 `v-html`：不受 scoped 的影响。

> - scoped styles 是不能消除对 class 的需求：最好不要在 `<style scoped>` 中使用元素选择器。
> - 注意递归组件的影响。

### 热重载

热重载会在 `webpack-dev-server --hot` 时自动开启。

## 实践

Vue Loader 是如何做到为 Vue 组件的每个部分应用其他 Loader 的？

使用 webpack loader 将 `<style>` 和 `<template>` 中引用的资源当作依赖进行处理，如何理解？

模拟 scoped CSS 需要哪些步骤呢？

