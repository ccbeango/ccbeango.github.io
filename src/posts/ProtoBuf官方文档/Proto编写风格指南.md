---
title: "Proto编写风格指南"
date: "2022-04-26 21:06:27"
series:
  name: "ProtoBuf官方文档"
  order: 2
tags:
  - "ProtoBuf官方文档"
draft: false
---

此为是`.proto`文件的编写风格指南。按此约定，将使得Protocol Buffer的message定义和对应class保持一致性并易于阅读。

请注意，Protocol Buffer风格随着时间的推移而发展，因此您可能会看到以不同的约定或样式编写的`.proto`文件。修改这些文件时，请尊重现有样式。**一致性是关键。**但是，当创建新的.proto文件时，最好采用当前最佳风格。

## 标准格式

- 行长度保持在80个字符
- 使用2个空格缩进
- 字符串最好使用双引号

## 文件结构

文件以小写下划线的格式命名：`lower_snake_case.proto`

All files should be ordered in the following manner:

1. License header (if applicable)
2. File overview
3. Syntax
4. Package
5. Imports (sorted)
6. File options
7. Everything else

## package 包名

包名应小写。包名称应基于项目名称具有唯一的名称，并且可能基于包含protocol buffer类型定义的文件的路径。

## message和字段名

message名使用大驼峰，如`SongServerRequest`。

字段名使用下划线分割名`underscore_separated_names`，包括oneof字段和扩展名，如`song_name`

```protobuf
message SongServerRequest {
  optional string song_name = 1;
}
```

对字段名使用下面命名原则提供如下的访问器：

```protobuf
C++:
  const string& song_name() { ... }
  void set_song_name(const string& x) { ... }

Java:
  public String getSongName() { ... }
  public Builder setSongName(String v) { ... }
```

如果字段名包含数字，数字应该出现在字母之后，而不是下划线之后。例如，使用 `song_name1`代替 `song_name_1`

## repaeted 字段

对`repeated`字段使用复数名称

```protobuf
repeated string keys = 1;
...
repeated MyMessage accounts = 17;
```

## Enums

对枚举类型名使用大驼峰，对值名使用大写加下划线`CAPITALS_WITH_UNDERSCORES`

```protobuf
enum FooBar {
  FOO_BAR_UNSPECIFIED = 0;
  FOO_BAR_FIRST_VALUE = 1;
  FOO_BAR_SECOND_VALUE = 2;
}
```

每个枚举值应以分号结尾，而不是逗号。宁愿在枚举值前面加上前缀，而不是将它们包围在一个封闭的消息中。零值的枚举应该有 `UNSPECIFIED`后缀。

## Services

如果使用`.proto`定义一个 RPC 服务，应该对服务名和任何 RPC 方法名使用大驼峰

```protobuf
service FooService {
  rpc GetSomething(GetSomethingRequest) returns (GetSomethingResponse);
  rpc ListSomething(ListSomethingRequest) returns (ListSomethingResponse);
}
```

## Things to avoid

- Required fields (only for proto2)
- Groups (only for proto2)
