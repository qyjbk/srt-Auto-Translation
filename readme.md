# srt文件转中文js脚本

本脚本是一个用于自动搜索同目录下srt目录下的 SRT 文件，并使用有道翻译的 API 进行翻译的工具。

## 原理

1. 遍历指定目录下的所有文件，查找扩展名为 `.srt` 的文件。
2. 对于每个找到的 SRT 文件，读取文件内容。
3. 使用正则表达式匹配需要翻译的文本，例如匹配 SRT 文件中的对话文本行。
4. 对匹配到的文本进行翻译，调用有道翻译的 API 接口传入待翻译文本，并获取翻译结果。
5. 将翻译结果写入文件，可以是原始 SRT 文件的副本或者另一个文件。
6. 重复步骤 3-5，直到所有需要翻译的文本都被翻译并替换。
7. 完成翻译后，输出翻译结果或者进行其他后续操作。



## 运行

确保您的电脑有node环境

```
// 此版本为开发版本
运行环境 node -v16.14.2
```



1. 将需要翻译的文件移动到项目文件的srt目录下

2. 在终端程序入口处运行

   ```
   node main.js
   ```

   



## 打赏

如果本脚本对您有用，肯定作者的付出，感谢您打赏一杯咖啡，激励作者继续开源创作。

![4cf4aec63f979b254a78667beb43e34c](.\img\4cf4aec63f979b254a78667beb43e34c.png)

## 联系方式



### 邮箱

kkshen15@gmail.com

### 微信

Skw957957

## 版权声明：

本脚本的版权归原作者所有，未经授权不得用于商业用途。脚本中使用的有道翻译 API 接口属于有道翻译服务，使用需遵守其相关使用条款和许可。请在使用脚本前仔细阅读相关服务的条款和许可，并确保遵守所有法律和规定。