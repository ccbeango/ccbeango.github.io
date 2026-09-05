---
title: "proto3语法指南"
date: "2022-04-26 21:06:27"
series:
  name: "ProtoBuf官方文档"
  order: 1
tags:
  - "ProtoBuf官方文档"
draft: false
---

本文为阅读官方文档[Language Guide (protp3)](https://developers.google.com/protocol-buffers/docs/proto3)相关总结。主要包括文档要点翻译(非逐句翻译)以及个人理解。

本指南主要是介绍如何使用ProtocolBuffer来构造自己的协议buffer数据，包括`.proto`语法以及如何从定义的`.proto`中生成数据访问类。

## 定义message类型

先来看一个非常简单的例子。假设你想定义一个“搜索请求”的消息格式，每一个请求含有一个查询字符串、你感兴趣的查询结果所在的页数，以及每一页多少条查询结果。可以采用如下的方式来定义消息类型的`.proto`文件：

```protobuf
syntax = "proto3";

message SearchRequest {
	string query = 1;
	int32 page_number = 2;
	int32 result_per_page = 3;
}
```

- 第一行指定正在使用`proto3`的语法。如果不指定，ProrocolBuffer编译器默认使用`proto2`。必须在第一行，前面不允许有空行或注释。
- `SearchRequest`包含三个指定的字段（`name/value`对），每个字段指定要包含在此message类型中的数据。每个字段都有一个`name`和一个`type`

### 指定字段类型

在上面的例子中，所有字段都是标量类型：两个整型（page_number和result_per_page），一个string类型（query）。当然，你也可以为字段指定其他的合成类型，包括枚举（enumerations）或其他消息类型。

### 分配字段编号

每个字段定义都已一个唯一数字**unique number**即字段编号。字段编号用于二进制消息格式中标识字段。并且一旦使用则不应更改。

注意：

- 范围1到15的字段编号以一个字节编码，包括字段号和字段类型，可以在 [Protocol Buffer Encoding](https://developers.google.com/protocol-buffers/docs/encoding#structure) 中找到更多相关信息。范围16到2047的字段编号以两个字节编码。所以，应该经常出现的字段应该保存到1到15。要记住给为将来可能添加频繁出现的字段预留空间。
- 最小字段编号是1，最大是$2^{29} - 1$ 即536870911。
- 不能使用19000~19999作为编号（从FieldDescriptor::kFirstReservedNumber 到 FieldDescriptor::kLastReservedNumber），Protobuf协议实现中对这些进行了预留，如果非要在`.proto`文件中使用这些预留标识号，编译时就会报警。
- 不能使用之前你自己定义在 [reserved](https://developers.google.com/protocol-buffers/docs/proto3#reserved)的字段编号。

### 指定字段规则

所指定的消息字段修饰符必须是如下之一：

- `singular` 字段默认值。一个格式良好的消息应该有0个或者1个这种字段（但是不能超过1个）。
- `repeated` 在一个格式良好的消息中，这种字段可以重复任意多次（包括0次）。重复的值的顺序会被保留。

在Proto3中，标量数字类型的`repeated`字段默认使用`packed`编码。

可以在 [Protocol Buffer Encoding](https://developers.google.com/protocol-buffers/docs/encoding#packed) 中找到有关`packed`编码的更多信息。

### 添加多个message类型

一个`.proto`文件中可以定义多个message类型。在定义多个相关的消息的时候，这一点特别有用——例如，如果想定义与`SearchResponse`消息类型对应的回复消息格式的话，你可以将它添加到相同的`.proto`文件中，如：

```protobuf
message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 result_per_page = 3;
}

message SearchResponse {
 ...
}
```

### 添加注释

在`.proto`中，可以使用C/C++/Java风格的双斜杠`//` 语法格式、多行注释使用`/* ... */`

```protobuf
/* SearchRequest represents a search query, with pagination options to
 * indicate which results to include in the response. */

message SearchRequest {
  string query = 1;
  int32 page_number = 2;  // Which page number do we want?
  int32 result_per_page = 3;  // Number of results to return per page.
}
```

### 保留标识符（Reserved）

如果你通过完全删除字段或注释字段来更新一个message类型，那么在未来，当用户更新该message时，可以重用该字段编号。

如果你使用旧版本加载相同的.proto文件会导致严重的问题，包括数据损坏、隐私错误等等。

现在有一种确保不会发生这种情况的方法就是为字段tag（reserved name可能会JSON序列化的问题）指定`reserved`标识符，protocol buffer的编译器会警告未来尝试使用这些域标识符的用户。

```protobuf
message Foo {
  reserved 2, 15, 9 to 11;
  reserved "foo", "bar";
  // reserved 2 "foo"; // Error
}
```

注意，不能在一个`reserved`声明中混用字段名和字段编号。

### 从**.proto**文件生成了什么

当用protocol buffer编译器来运行.proto文件时，编译器将生成所选择语言的代码，这些代码可以操作在.proto文件中定义的消息类型，包括获取、设置字段值，将消息序列化到一个输出流中，以及从一个输入流中解析消息。

- For **C++**, the compiler generates a `.h` and `.cc` file from each `.proto`, with a class for each message type described in your file.
- For **Java**, the compiler generates a `.java` file with a class for each message type, as well as a special `Builder` class for creating message class instances.
- For **Kotlin**, in addition to the Java generated code, the compiler generates a `.kt` file for each message type, containing a DSL which can be used to simplify creating message instances.
- **Python** is a little different — the Python compiler generates a module with a static descriptor of each message type in your `.proto`, which is then used with a _metaclass_ to create the necessary Python data access class at runtime.
- For **Go**, the compiler generates a `.pb.go` file with a type for each message type in your file.
- For **Ruby**, the compiler generates a `.rb` file with a Ruby module containing your message types.
- For **Objective-C**, the compiler generates a `pbobjc.h` and `pbobjc.m` file from each `.proto`, with a class for each message type described in your file.
- For **C#**, the compiler generates a `.cs` file from each `.proto`, with a class for each message type described in your file.
- For **Dart**, the compiler generates a `.pb.dart` file with a class for each message type in your file.

You can find out more about using the APIs for each language by following the tutorial for your chosen language (proto3 versions coming soon). For even more API details, see the relevant [API reference](https://developers.google.com/protocol-buffers/docs/reference/overview) (proto3 versions also coming soon).

## 标量数值类型

一个标量消息字段可以含有一个如下的类型——该表格展示了定义于.proto文件中的类型，以及与之对应的、在自动生成的访问类中定义的类型：

| .proto Type | Notes                                                                      | C++ Type | Java/Kotlin Type[1] | Python Type[3]                      | Go Type | Ruby Type                      | C# Type    |    PHP Type    |
| :---------- | :------------------------------------------------------------------------- | :------- | :------------------ | :---------------------------------- | :------ | :----------------------------- | :--------- | :------------: |
| double      |                                                                            | double   | double              | float                               | float64 | Float                          | double     |     float      |
| float       |                                                                            | float    | float               | float                               | float32 | Float                          | float      |     float      |
| int32       | 使用变长编码，对于负值的效率很低，如果你的域有可能有负值，请使用sint64替代 | int32    | int                 | int                                 | int32   | Fixnum 或者 Bignum（根据需要） | int        |    integer     |
| uint32      | 使用变长编码                                                               | uint32   | int                 | int/long                            | uint32  | Fixnum 或者 Bignum（根据需要） | uint       |    integer     |
| uint64      | 使用变长编码                                                               | uint64   | long                | int/long                            | uint64  | Bignum                         | ulong      | integer/string |
| sint32      | 使用变长编码，这些编码在负值时比int32高效的多                              | int32    | int                 | int                                 | int32   | Fixnum 或者 Bignum（根据需要） | int        |    integer     |
| sint64      | 使用变长编码，有符号的整型值。编码时比通常的int64高效。                    | int64    | long                | int/long                            | int64   | Bignum                         | long       | integer/string |
| fixed32     | 总是4个字节，如果数值总是比总是比228大的话，这个类型会比uint32高效。       | uint32   | int                 | int                                 | uint32  | Fixnum 或者 Bignum（根据需要） | uint       |    integer     |
| fixed64     | 总是8个字节，如果数值总是比总是比256大的话，这个类型会比uint64高效。       | uint64   | long                | int/long                            | uint64  | Bignum                         | ulong      | integer/string |
| sfixed32    | 总是4个字节                                                                | int32    | int                 | int                                 | int32   | Fixnum 或者 Bignum（根据需要） | int        |    integer     |
| sfixed64    | 总是8个字节                                                                | int64    | long                | int/long                            | int64   | Bignum                         | long       | integer/string |
| bool        |                                                                            | bool     | boolean             | bool                                | bool    | TrueClass/FalseClass           | bool       |    boolean     |
| string      | 一个字符串必须是UTF-8编码或者7-bit ASCII编码的文本。                       | string   | String              | str/unicode                         | string  | String (UTF-8)                 | string     |     string     |
| bytes       | 可能包含任意顺序的字节数据。                                               | string   | ByteString          | str (Python 2)<br/>bytes (Python 3) | []byte  | String (ASCII-8BIT)            | ByteString |     string     |

你可以在文章[Protocol Buffer 编码](https://developers.google.com/protocol-buffers/docs/encoding?hl=zh-cn)中，找到更多“序列化消息时各种类型如何编码”的信息。

1. 在java中，无符号32位和64位整型被表示成他们的整型对应形式，最高位被储存在标志位中。
2. 对于所有的情况，设定值会执行类型检查以确保此值是有效。
3. 64位或者无符号32位整型在解码时被表示成为ilong，但是在设置时可以使用int型值设定，在所有的情况下，值必须符合其设置其类型的要求。
4. python中string被表示成在解码时表示成unicode。但是一个ASCIIstring可以被表示成str类型。
5. Integer在64位的机器上使用，string在32位机器上使用

## 默认类型

当一个message被解析的时候，对于**`singular`字段**，如果已编码的消息不包含某个特定的`singular `字段，那么在解析对象中的响应字段会被设置为默认值。这些特定类型的默认值如下：

- 对于string，默认是一个空string
- 对于bytes，默认是一个空的bytes
- 对于bool，默认是false
- 对于数值类型，默认是0
- 对于枚举，默认是第一个定义的枚举值，必须为0;
- 对于消息类型（message），域没有被设置，确切的消息是根据语言确定的，详见[generated code guide](https://developers.google.com/protocol-buffers/docs/reference/overview)

对于可重复域`repeated`的默认值是空（通常情况下是对应语言中空列表）。

注意：

- 对于message中的标量类型字段，一旦message被解析，就无法确定字段是否是被明确地设置为默认值（如一个布尔类型被显示地设置为`false`）还是没设置（默认使用了`false`）。你应该在定义你的消息类型时非常注意。例如，如果不希望某个行为在默认情况下发生，那么就不要设置一个布尔值在默认情况下开启这个行为。
- 如果一个标量message字段设置成了默认值，那么该值不会被序列化传输。

查看[generated code guide](https://developers.google.com/protocol-buffers/docs/reference/overview?hl=zh-cn)选择你的语言的默认值的工作细节。

## 枚举

当需要定义一个消息类型的时候，可能想为一个字段指定某“预定义值序列”中的一个值。例如，假设要为每一个`SearchRequest`消息添加一个`corpus`字段，而`corpus`的值可能是`UNIVERSAL`，`WEB`，`IMAGES`，`LOCAL`，`NEWS`，`PRODUCTS`或`VIDEO`中的一个。 其实可以很容易地实现这一点：通过向消息定义中添加一个枚举（enum）并且为每个可能的值定义一个常量就可以了。

定义常量枚举类型，下面我们定义了一个名为`Corpus`的枚举其中包含所有值，并设置了一个`Corpus`类型的字段`corpus`：

```protobuf
message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 result_per_page = 3;
  enum Corpus {
    UNIVERSAL = 0;
    WEB = 1;
    IMAGES = 2;
    LOCAL = 3;
    NEWS = 4;
    PRODUCTS = 5;
    VIDEO = 6;
  }
  Corpus corpus = 4;
}
```

如你所见，Corpus枚举的第一个常量映射为0，每个枚举类型必须将其第一个类型映射为0，这是因为：

- 必须有一个0的值，我们可以用这个0值作为默认值。注：在proto3的默认值规定中，枚举的缺省值为0；
- 这个零值必须为第一个元素，为了兼容proto2语义，枚举类的第一个值总是默认值。

### 别名定义

枚举允许定义别名，通过分配相同的值给不同的枚举常量来实现。另外要设置`allow_alias`选项为`true`，否则编译器会报错。

```protobuf
message MyMessage1 {
  enum EnumAllowingAlias {
    option allow_alias = true;
    UNKNOWN = 0;
    STARTED = 1;
    RUNNING = 1;
  }
}
message MyMessage2 {
  enum EnumNotAllowingAlias {
    UNKNOWN = 0;
    STARTED = 1;
    // RUNNING = 1;  // Uncommenting this line will cause a compile error inside Google and a warning message outside.
  }
}
```

### 枚举值范围

枚举常量必须在32位整数的范围内。由于枚举值在线路上使用 [varint encoding](https://developers.google.com/protocol-buffers/docs/encoding)编码，负值效率低，因此不推荐使用。

### 枚举复用

枚举值可以定义在message定义中，像上面的例子；也可以定义在外面，那么就可以被其它message定义复用。

```protobuf
enum Corpus {
  UNIVERSAL = 0;
  WEB = 1;
  IMAGES = 2;
  LOCAL = 3;
  NEWS = 4;
  PRODUCTS = 5;
  VIDEO = 6;
}

message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 result_per_page = 3;
  Corpus corpus = 4;
}

message SearchResponse {
  int32 code = 1;
  Corpus corpus = 2;
}
```

也可以在一个message中通过使用`_MessageType_._EnumType_`的语法格式使用定义在其它message中的枚举类型。如：

```protobuf
message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 result_per_page = 3;
  enum Corpus {
    UNIVERSAL = 0;
    WEB = 1;
    IMAGES = 2;
    LOCAL = 3;
    NEWS = 4;
    PRODUCTS = 5;
    VIDEO = 6;
  }
  Corpus corpus = 4;
}

message SearchResponse {
  int32 code = 1;
  SearchRequest.Corpus corpus = 2;
}
```

### 编译相关

当对一个使用了枚举的`.proto`文件运行protocol buffer编译器的时候，生成的代码中将有一个对应的`enum`（对Java或C++来说），或者一个特殊的`EnumDescriptor`类（对 Python来说），它被用来在运行时生成的类中创建一系列的整型值符号常量（symbolic constants）。

在反序列化的过程中，无法识别的枚举值会被保存在消息中，虽然这种表示方式需要依据所使用语言而定。在那些支持开放枚举类型超出指定范围之外的语言中（例如C++和Go），未知枚举值只是存储为它的底层整数表示形式。在使用封闭枚举类型的语言中（Java），使用枚举中的一个类型来表示未识别的值，并且可以使用所支持整型来访问。在其他情况下，如果解析的消息被序列号，未识别的值将保持原样。

关于如何在你的应用程序的消息中使用枚举的更多信息，请查看所选择的语言[generated code guide](http://code.google.com/intl/zh-CN/apis/protocolbuffers/docs/reference/overview.html)。

### 枚举的保留值

如果通过完全移除字段或注释字段来更新一个message类型，那么在未来，当用户更新该message时，可以重用该字段编号。

如果以后加载同一个`.proto`的旧版本，可能会导致严重的问题，如数据损坏、隐私漏洞等。

确保不会出现此情况出现的方法是：

- 指定要删除的字段编号为`reserved`。
- 指定要删除的字段名为`reserved`，但可能会导致JSON序列化的问题。

可以使用最大关键字指定保留数字值范围为最大值。

```protobuf
enum Foo {
  reserved 2, 15, 9 to 11, 40 to max;
  reserved "FOO", "BAR";
}
```

注意，不能在一个`reserved`声明中混用字段名和数字值。

## 使用其它message类型

可以使用其它message类型作为字段类型。

例如，假设在每一个`SearchResponse`消息中包含`Result`消息，此时可以在相同的`.proto`文件中定义一个`Result`消息类型，然后在`SearchResponse`消息中指定一个`Result`类型的字段，如：

```protobuf
message SearchResponse {
  repeated Result results = 1;
}

message Result {
  string url = 1;
  string title = 2;
  repeated string snippets = 3;
}
```

### 导入定义

在上面的示例中，Result 消息类型定义在与 SearchResponse 相同的文件中，如果希望用作字段类型的message类型已经在另一个文件中定义了，该怎么办？

你可以通过导入（importing）其他`.proto`文件中的定义来使用它们。要导入其他`.proto`文件的定义，你需要在你的文件中添加一个导入声明，如：

```protobuf
import "myproject/other_protos.proto";
```

默认情况下，只能使用直接导入的`.proto`文件中的定义。但有时可能需要将`.proto`文件移至新位置。那么可以在旧位置放一个占位符**placeholder**的`.proto`文件，以`import public`概念转发所有的导入到新的位置，而不是直接移动`.proto`文件并更新所有的调用位置因为一个点的变化。

要注意，公共导入功能在Java中不可用。

任何包含`import public`声明的导入proto文件，可以传递性的依赖被导入的proto文件。例如：

```protobuf
// new.proto
// All definitions are moved here
```

```protobuf
// old.proto
// This is the proto that all clients are importing.
import public "new.proto";
import "other.proto";
```

```protobuf
// client.proto
import "old.proto";
// You use definitions from old.proto and new.proto, but not other.proto
```

那么，在`client.proto`中可以使用`old.proto`和`new.proto`中定义的message，但不能使用`other.proto`中的。

编译器使用`-I`/`-- proto _ path`标志在编译器命令行上指定的一组目录中搜索导入的文件。如果没有给出此标志参数，则查询调用编译器的目录。通常，应该将 `-- proto _ path` 标志设置为项目的根目录，并指定好导入的正确名称就好。

### 使用proto2的message类型

可以导入 proto2消息类型并在 proto3消息中使用它们，反之亦然。然而，proto2的枚举类型不能直接用于 proto3语法（如果仅仅在proto2消息中使用是可以的）

## 嵌套类型

你可以在其他消息类型中定义、使用消息类型，在下面的例子中，Result消息就定义在SearchResponse消息内，如：

```protobuf
message SearchResponse {
  message Result {
    string url = 1;
    string title = 2;
    repeated string snippets = 3;
  }
  repeated Result results = 1;
}
```

如果要在其父消息类型之外复用此message类型，可`_Parent_._Type_`引用：

```protobuf
message SomeOtherMessage {
  SearchResponse.Result result = 1;
}
```

可以将message嵌套多层：

```protobuf
message Outer {                  // Level 0
  message MiddleAA {  // Level 1
    message Inner {   // Level 2
      int64 ival = 1;
      bool  booly = 2;
    }
  }
  message MiddleBB {  // Level 1
    message Inner {   // Level 2
      int32 ival = 1;
      bool  booly = 2;
    }
  }
}
```

## 更新一个message类型

如果现有的message类型不再满足需求，例如，要在消息中添加一个额外的字段——但是同时旧版本写的代码仍然可用，不用担心。更新message而不破坏已有代码是非常简单的。

在更新时只要记住以下的规则即可：

- 不要更改任何已有的字段编号。
- 如果添加新字段，那么任何使用旧message格式序列化的message仍可以通过新生成的代码进行解析。要记住这些元素的默认值，以便新代码可以正确地与旧代码生成的message交互。同样，新代码创建的message可以被旧代码解析，只不过新的字段会被忽略掉。详间 [Unknown Fields](https://developers.google.com/protocol-buffers/docs/proto3#unknowns)
- 字段可以被删除，只要字段编号不再用于更新的message类型。你可能想重命名字段作为替代，如添加前缀”OBSOLETE_“，或保留字段编号，以避免之后有人不小心复用了该字段编号。
- int32、 uint32、 int64、 uint64和 bool 都是兼容的——这意味着您可以在不破坏向前或向后兼容性的情况下将一个字段从这些类型中的一个更改为另一个。如果一个数字被解析出来不匹配对应的type，那么你会得到与在C++中将数字转成该类型相同的类型（例如，如果一个64位的数字被读作 int32，它将被截断为32位）。
- sint32和 sint64相互兼容，但与其他整数类型不兼容。
- `string`和`bytes`是兼容的，只要字节是有效的 UTF-8编码。
- 嵌套消息与bytes是兼容的——只要bytes包含该消息的一个编码过的版本。
- `fixed32`与 `sfixed32`兼容，`fixed64`与`sfixed64`兼容。
- 对于`string`、`bytes`和message字段，`optional`字段和`repeated`字段兼容。给定一个重复字段的序列化数据作为输入，如果此字段是一个基本类型字段，那么期望此字段是`optional`的客户端会接受最后一个输入值；如果是一个message类型的字段，则会合并所有的输入元素。注意，这对于数字类型（包括bools和enums）通常是不安全的。重复的数值类型字段可以按打包格式[packed](https://developers.google.com/protocol-buffers/docs/encoding#packed)序列化，如果需要可选字段，则不能正确解析这些字段。
- `enum`与`int32`、 `uint32`、 `int64`和 `uint64`兼容（注意，如果不合适，值将被截断）。但要注意的是，当message被反序列化时，客户端代码可能会区别对待它们，例如，未被识别的proto3枚举类型将保留在消息中，但是当消息被反序列化时，这种类型的表示方式依赖于语言。Int 字段总是保留它们的值。
- 将`single`值的字段改为新的`oneof`值的字段是安全的且二进制兼容。如果能确定没有代码一次设置多个字段，那么将`multiple`值的字段改为`oneof`值的字段是安全的。将`any`值的字段改成现有的`oneof`值的字段是不安全的。

## 未知字段

未知字段指的是符合语法规则的Protocol Buffer序列化数据中存在解析器无法识别的字段。

例如，当一个旧得二进制解析数据被一个带有新字段的新二进制发送时，这些新字段变成了旧二进制中的未知字段。

最初，proto3消息总在解析过程中丢弃未知字段，但在3.5版本中，重新引入了未知字段的保留以此来匹配proto2的行为。在3.5及以后的版本中，未知字段会在解析过程中保留，并将其包含在序列化输出中。

## any类型

any类型消息允许你在没有指定他们的`.proto`定义的情况下使用消息作为一个嵌套类型。一个Any类型包括一个可以被序列化bytes类型的任意消息，以及一个URL作为一个全局标识符和解析消息类型。

为了使用any类型，你需要导入`import google/protobuf/any.proto`。

```protobuf
import "google/protobuf/any.proto";

message ErrorStatus {
  string message = 1;
  repeated google.protobuf.Any details = 2;
}
```

给定消息类型的默认类型 URL 是`type.googleapis.com/_packagename_._messagename_`。

不同语言的实现会支持动态库以线程安全(typesafe)的方式去帮助封装或者解封装Any值——例如，在 Java 中，Any 类型将有特殊的 `pack ()`和 `unpack ()`访问器，而在 C++中有`PackFrom()`和`UnpackTo ()`方法:

```protobuf
// Storing an arbitrary message type in Any.
NetworkErrorDetails details = ...;
ErrorStatus status;
status.add_details()->PackFrom(details);

// Reading an arbitrary message from Any.
ErrorStatus status = ...;
for (const Any& detail : status.details()) {
  if (detail.Is<NetworkErrorDetails>()) {
    NetworkErrorDetails network_error;
    detail.UnpackTo(&network_error);
    ... processing network_error ...
  }
}
```

目前，用于Any类型的动态库仍在开发之中

If you are already familiar with [proto2 syntax](https://developers.google.com/protocol-buffers/docs/proto), the `Any` can hold arbitrary proto3 messages, similar to proto2 messages which can allow [extensions](https://developers.google.com/protocol-buffers/docs/proto#extensions).

## oneof类型

如果有一条包含许多字段的消息，并且最多同时设置一个字段，那么可以通过使用`oneof`特性来强制执行此行为并节省内存。

oneof字段类似于常规字段，除了所有字段在一个oneof共享内存中，而且最多同时设置一个字段。设置其中的任何成员都会自动清除所有其它成员。可以使用专门的`case()`或`WhichOneof()`方法来检查oneof中哪个值被设置了，具体使用哪个方法取决与你使用的语言。

### 使用oneof

为了在`.proto`定义Oneof字段， 你需要在名字前面加上`oneof`关键字, 比如下面例子的`test_oneof`:

```protobuf
message SampleMessage {
  oneof test_oneof {
    string name = 4;
    SubMessage sub_message = 9;
  }
}
```

然后可以添加任何类型的字段到oneof定义中，除了`map`字段和`repeated`字段。

在生成的代码中，oneof字段具有与常规字段相同的 getter 和 setter。还有一个专门的方法来检查oneof中设置了哪个值(如果有的话)。更多关于oneof API的信息参考你使用的语方言的 [API reference](https://developers.google.com/protocol-buffers/docs/reference/overview)。

### Oneof Features

- 设置一个oneof字段将自动清除该oneof字段的所有其他成员。因此，如果设置了数个oneof字段，那么只有最后设置的字段有值。

  ```protobuf
  SampleMessage message;
  message.set_name("name");
  CHECK(message.has_name());
  message.mutable_sub_message();   // Will clear name field.
  CHECK(!message.has_name());
  ```

- 如果解析器遇到同一个oneof的多个成员，则只有最后的成员会被用于解析消息。

- oneof不能是`repeated`的

- Reflection APIs work for oneof fields.

- 如果将 oneof 字段设置为默认值(例如将 int32 oneof 字段设置为0) ，那么将设置该字段的值为`oneof`中的指定值，并且该值会被序列化。

- 如果使用C++,需确保代码不会导致内存泄漏. 下面的代码会崩溃， 因为sub_message 已经通过set_name()删除了

  ```c++
  SampleMessage message;
  SubMessage* sub_message = message.mutable_sub_message();
  message.set_name("name");      // Will delete sub_message
  sub_message->set_...            // Crashes here
  ```

- Again，在C++中，如果你使用Swap()两个oneof消息，每个消息，两个消息将拥有对方的值，例如在下面的例子中，msg1会拥有sub_message并且msg2会有name。

  ```c++
  SampleMessage msg1;
  msg1.set_name("name");
  SampleMessage msg2;
  msg2.mutable_sub_message();
  msg1.swap(&msg2);
  CHECK(msg1.has_sub_message());
  CHECK(msg2.has_name());
  ```

### 向后兼容问题

添加或删除oneof字段时候要小心。如果检查oneof的返回值是`None`或`NOT_SET`，这可能意味着oneof没有被赋值，或者在一个不同的版本中被赋值了。没有办法区分，因为没有办法知道一个未知字段是否是oneof的成员。

#### Tag 复用问题

- **将字段移入或移出oneof**：在序列化和解析消息之后，您可能会丢失一些信息(某些字段将被清除)。但是，您可以安全地将单个字段移动到新的oneof字段中，并且如果已知之前只设置了一个字段，则可以移动多个字段。
- **删除一个字段并将其添加回来：**这可能会在消息被序列化和解析之后清除当前设置的oneof字段。
- **分割或合并oneof：**和移动常规字段问题相似。即和将字段移入或移出oneof类似。

## map类型

如果你想创建一个关联映射作为你数据定义的一部分，Protocol Buffers提供了一个方便的快捷语法：

```protobuf
map<key_type, value_type> map_field = N;
```

- `key_type`可以是任意的`intergral`类型或`string`类型。因此，可以是除了浮点类型`floating point`和`types`类型外的任意标量类型。

- `value_type`可以是除了另一个`map`类型的任意类型。

例如，如果你希望创建一个project的映射，每个Projecct使用一个string作为key，你可以像下面这样定义：

```protobuf
map<string, Project> projects = 3;
```

需要注意的点：

- map不能是`repeated`的
- 序列化后的顺序和map迭代器的顺序是不确定的，所以你不要期望以固定顺序处理Map
- 当为.proto文件产生生成文本格式的时候，map会按照key 的顺序排序，数值化的key会按照数值排序。
- 当从buffer中解析或合并时，如果有重复的map键，则使用最后出现的键。当从文本格式解析映射时，如果有重复的键，解析可能会失败。
- 如果为映射字段提供了键但没有值，则该字段序列化时的行为与语言相关。在C++ 、 Java、 Kotlin 和 Python 中，类型的默认值是序列化的，而在其他语言中，没有任何值是序列化的。

生成的map API 目前可用于所有支持 proto3的语言。您可以在相关的 [API reference](https://developers.google.com/protocol-buffers/docs/reference/overview)中找到更多关于所选语言的映射 API 的信息。

### 向后兼容

map的语法等价于下面的语法，因此不支持maps的Protocol Buffer实现仍然可以处理你的数据：

```protobuf
message MapFieldEntry {
  key_type key = 1;
  value_type value = 2;
}

repeated MapFieldEntry map_field = N;
```

任何支持maps的Protocol Buffer实现都必须生成和接受上述定义可以接受的数据。

## package

可以向`.proto` 文件添加一个可选`package`声明符，以防止协议消息类型之间的名称冲突。

```protobuf
package foo.bar;
message Open { ... }
```

然后，可以在定义message类型的字段时使用`package`说明符:

```protobuf
message Foo {
  ...
  foo.bar.Open open = 1;
  ...
}
```

package声明符会根据使用语言的不同影响生成的代码。

- 对于C++，产生的类会被包装在C++的命名空间中，如上例中的Open会被封装在 foo::bar空间中； - 对于Java，包声明符会变为java的一个包，除非在.proto文件中提供了一个明确有java_package；
- 对于 Python，这个包声明符是被忽略的，因为Python模块是按照其在文件系统中的位置进行组织的。
- 对于Go，包可以被用做Go包名称，除非你显式的提供一个option go_package在你的.proto文件中。
- 对于Ruby，生成的类可以被包装在内置的Ruby名称空间中，转换成Ruby所需的大小写样式 （首字母大写；如果第一个符号不是一个字母，则使用PB_前缀），例如Open会在Foo::Bar名称空间中。
- 对于javaNano包会使用Java包，除非你在你的文件中显式的提供一个option java_package。
- 对于C#包可以转换为PascalCase后作为名称空间，除非你在你的文件中显式的提供一个option csharp_namespace，例如，Open会在Foo.Bar名称空间中

### 包和包名解析

在 Protocol Buffer 中，类型名称解析的工作原理类似于 C++ : 首先搜索最内层的作用域，然后搜索下一个最内层的作用域，依此类推，每个包会被看作是其父类包的内部类。当然对于 （foo.bar.Baz）这样以“.”分隔的意味着是从最外层作用域开始的。

ProtocolBuffer编译器通过解析导入的`.proto`文件来解决所有类型名称。每种语言的代码生成器都知道如何在该语言中引用每种类型，即使它有不同的作用域规则。

## 定义Services

如果希望将消息类型与 RPC (远程过程调用)系统一起使用，可以在.proto文件中定义RPC服务接口，编译器将以您选择的语言生成服务接口代码和存根。

因此，例如，如果您希望定义一个 RPC 服务，其方法接受 SearchRequest 并返回一个 SearchResponse，则可以在`.proto`文件中定义它，如下所示：

```protobuf
service SearchService {
  rpc Search(SearchRequest) returns (SearchResponse);
}
```

最直观的使用protocol buffer的RPC系统是[gRPC](https://github.com/grpc/grpc-experiments),一个由谷歌开发的语言和平台中的开源的PRC系统，gRPC在使用protocl buffer时非常有效，如果使用特殊的protocol buffer插件可以直接为您从.proto文件中产生相关的RPC代码。

如果你不想使用gRPC，也可以使用protocol buffer用于自己的RPC实现，你可以从[proto2语言指南](https://developers.google.com/protocol-buffers/docs/proto#services)中找到更多信息

还有一些第三方开发的PRC实现使用Protocol Buffer。参考[第三方插件wiki](https://github.com/google/protobuf/blob/master/docs/third_party.md)查看这些实现的列表。

## JSON映射

Proto3支持JSON中的规范编码，从而更容易在系统之间共享数据。在下表中逐个描述类型。

如果在JSON编码的数据中缺少一个值，或者其值为null，那么在Protocol Buffer解析时，该值将被解释为适当的默认值。如果一个字段在协议缓冲区中具有默认值，为了节省空间，默认情况下 json 编码的数据中将省略该字段。JSON实现中可以提供选项以触发具有默认值的字段的选项的JSON编码输出。

表详见[JSON Mapping](https://developers.google.com/protocol-buffers/docs/proto3#adding_more_message_types)

Proto3 JSON实现应该具有的能力详见[JSON options](https://developers.google.com/protocol-buffers/docs/proto3#json_options)

## Options

`.proto`文件中的一个声明可以用多个选项注释。选项不会改变声明的总体含义。但可能会影响在特定上下文中处理声明的方式。可用选项的完整列表在 `google/protobuf/descriptor.proto` 中定义。

有些选项是文件级选项，这意味着它们应该在顶级作用域中编写，而不是在任何message、enum或服务定义中。有些选项是message级选项，这意味着它们应该写在message定义中。有些选项是field级选项，这意味着它们应该写在field定义中。选项也可以在枚举类型、枚举值、oneof字段、服务类型和服务方法上编写；但是，目前没有针对它们的有用选项。

常用选项详见[Options](https://developers.google.com/protocol-buffers/docs/proto3#options)

## Generating Your Classes

可以使用编译器`protoc`来生成对你使用语言的代码。

详见[Generating Your Classes](https://developers.google.com/protocol-buffers/docs/proto3#generating)
