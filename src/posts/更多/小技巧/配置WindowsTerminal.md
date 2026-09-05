---
title: "配置WindowsTerminal"
date: "2022-06-17 20:03:51"
tags:
  - "更多"
  - "小技巧"
draft: false
---

效果如下：

![配置WindowsTerminal01](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Tools/配置WindowsTerminal01.png)

步骤如下：

1. 安装Windows Termial
2. 安装新PowerShell，即新版Powershell
3. 安装新PowerShell插件，并配置脚本，优化新Powershell使用体验
4. Windows Termial中配置新PowerShell
5. 安装oh-my-posh和Nerd Font优化新PowerShell主题，让命令行变得更加炫酷优雅
6. 配置VSCode中使用新PowerShell

## 安装Windows Terminal

Microsoft Store中搜索Windows Terminal，然后点击安装。

或点击此链接[Windows Terminal](https://apps.microsoft.com/store/detail/windows-terminal/9N0DX20HK701?hl=zh-cn&gl=CN)获取

## 安装新Powershell

Powershell Core与 Windows 自带的 Powershell的升级版。

自带的 Powershell **错误提示冗长**，**颜值低**，**速度慢**。

打开Windows自带的Powershell会看到如下提示：

```shell
Windows PowerShell
版权所有 (C) Microsoft Corporation。保留所有权利。

尝试新的跨平台 PowerShell https://aka.ms/pscore6
```

尝试新的跨平台PowerShell就是我们要安装的Powershell Core，可以去[官方文档](https://aka.ms/pscore6)中下载安装包进行安装。

不过官网中可能不是最新的，可以从Github仓库的[Powershell](https://github.com/PowerShell/PowerShell)中下载最新的Powershell的msi安装包。

目前安装版本是：[v7.3.0-preview.4 Release of PowerShell](https://github.com/PowerShell/PowerShell/releases/tag/v7.3.0-preview.4)

## 安装新PowerShell插件

以**管理员模式**运行刚安装好的新Powershell

执行脚本安装如下插件：

```shell
# 1. 安装 PSReadline 包，该插件可以让命令行很好用，类似 zsh
Install-Module -Name PSReadLine  -Scope CurrentUser -Verbose

# 2. 安装 posh-git 包，让 git 更好用
Install-Module posh-git  -Scope CurrentUser
```

安装时系统会提问是否继续，直接输入 `A` 并回车即可。

在PowerShellCore中执行：

```shell
# 使用了VSCode
code $profile
```

注：这会在用户的文档目录下生成一个PowerShell脚本：`C:\Users\%USERNAME%\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`

粘贴如下脚本并保存：

```powershell
#------------------------------- Import Modules BEGIN -------------------------------
# 引入 posh-git
Import-Module posh-git

# 引入 ps-read-line
Import-Module PSReadLine

#------------------------------- Import Modules END   -------------------------------


#-------------------------------  Set Hot-keys BEGIN  -------------------------------
# 设置预测文本来源为历史记录
Set-PSReadLineOption -PredictionSource History

# 每次回溯输入历史，光标定位于输入内容末尾
Set-PSReadLineOption -HistorySearchCursorMovesToEnd

# 设置 Tab 为菜单补全和 Intellisense
Set-PSReadLineKeyHandler -Key "Tab" -Function MenuComplete

# 设置 Ctrl+d 为退出 PowerShell
Set-PSReadlineKeyHandler -Key "Ctrl+d" -Function ViExit

# 设置 Ctrl+z 为撤销
Set-PSReadLineKeyHandler -Key "Ctrl+z" -Function Undo

# 设置向上键为后向搜索历史记录
Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward

# 设置向下键为前向搜索历史纪录
Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
#-------------------------------  Set Hot-keys END    -------------------------------


#-------------------------------    Functions BEGIN   -------------------------------
# Python 直接执行
$env:PATHEXT += ";.py"

# 更新系统组件
function Update-Packages {
	# update pip
	Write-Host "Step 1: 更新 pip" -ForegroundColor Magenta -BackgroundColor Cyan
	$a = pip list --outdated
	$num_package = $a.Length - 2
	for ($i = 0; $i -lt $num_package; $i++) {
		$tmp = ($a[2 + $i].Split(" "))[0]
		pip install -U $tmp
	}

	# update TeX Live
	$CurrentYear = Get-Date -Format yyyy
	Write-Host "Step 2: 更新 TeX Live" $CurrentYear -ForegroundColor Magenta -BackgroundColor Cyan
	tlmgr update --self
	tlmgr update --all

	# update Chocolotey
	Write-Host "Step 3: 更新 Chocolatey" -ForegroundColor Magenta -BackgroundColor Cyan
	choco outdated
}
#-------------------------------    Functions END     -------------------------------

#-------------------------------    Functions For Node BEGIN   -------------------------------
# --- Node 管理器切换工具 ---
# 1. 定义物理路径（对应你的 D 盘安装目录）
$VOLTA_HOME_DIR = "D:\DevSoftware\Volta"
$NVM_HOME_DIR = "D:\DevSoftware\nvm"
$NVM_SYMLINK = "D:\DevSoftware\nodejs" # nvm-windows 默认创建的软链接位置

# 2. 切换到 nvm 函数
function use-nvm {
    # 从 PATH 中移除所有包含 Volta 的路径，并把 nvm 路径提到最前
    $newPath = ($env:PATH -split ';' | Where-Object { $_ -notlike "*Volta*" }) -join ';'
    $env:PATH = "$NVM_HOME_DIR;$NVM_SYMLINK;" + $newPath

    $env:NVM_HOME = $NVM_HOME_DIR
    $env:NVM_SYMLINK = $NVM_SYMLINK

    Write-Host ">>> 已切换至 nvm 模式 (D:\DevSoftware\nvm)" -ForegroundColor Cyan
    node -v
    where.exe node
}

# 3. 切换回 Volta 函数
function use-volta {
    # 从 PATH 中移除所有包含 nvm 的路径，并把 Volta 提到最前
    $newPath = ($env:PATH -split ';' | Where-Object { $_ -notlike "*nvm*" }) -join ';'
    $env:PATH = "$VOLTA_HOME_DIR;" + $newPath

    Write-Host ">>> 已恢复 Volta 模式 (D:\DevSoftware\Volta)" -ForegroundColor Yellow
    node -v
    where.exe node
}
#-------------------------------    Functions For Node END     -------------------------------


#-------------------------------   Set Alias BEGIN    -------------------------------
# 1. 编译函数 make
function MakeThings {
	nmake.exe $args -nologo
}
Set-Alias -Name make -Value MakeThings

# 2. 更新系统 os-update
Set-Alias -Name os-update -Value Update-Packages

# 3. 查看目录 ls & ll
function ListDirectory {
	(Get-ChildItem).Name
	Write-Host("")
}
Set-Alias -Name ls -Value ListDirectory
Set-Alias -Name ll -Value Get-ChildItem

# 4. 打开当前工作目录
function OpenCurrentFolder {
	param
	(
		# 输入要打开的路径
		# 用法示例：open C:\
		# 默认路径：当前工作文件夹
		$Path = '.'
	)
	Invoke-Item $Path
}
Set-Alias -Name open -Value OpenCurrentFolder

function Test {
	nmake.exe $args -nologo
}
#-------------------------------    Set Alias END     -------------------------------


#-------------------------------   Set Network BEGIN    -------------------------------
# 1. 获取所有 Network Interface
function Get-AllNic {
	Get-NetAdapter | Sort-Object -Property MacAddress
}
Set-Alias -Name getnic -Value Get-AllNic

# 2. 获取 IPv4 关键路由
function Get-IPv4Routes {
	Get-NetRoute -AddressFamily IPv4 | Where-Object -FilterScript {$_.NextHop -ne '0.0.0.0'}
}
Set-Alias -Name getip -Value Get-IPv4Routes

# 3. 获取 IPv6 关键路由
function Get-IPv6Routes {
	Get-NetRoute -AddressFamily IPv6 | Where-Object -FilterScript {$_.NextHop -ne '::'}
}
Set-Alias -Name getip6 -Value Get-IPv6Routes
#-------------------------------    Set Network END     -------------------------------
```

## 安装字体

在Github上下载字体[Fira Code Nerd Font](https://github.com/ryanoasis/nerd-fonts)，release中找到`FiraCode.zip`点击下载。

该字体支持 ligature 连字功能，而且是一款专门为代码显示准备的字体，该字体也支持很多有趣的特殊字符，非常适合在终端里使用。

这里只需要安装解压包中的一个Regular字体文件`Fira Code Regular Nerd Font Complete Mono Windows Compatible.ttf`，右键点击字体，点击安装即可。

## Windows Termial中配置新PowerShell

打开Windows Terminal，并点击设置，打开如下配置界面，并点击添加新的配置文件：

![配置WindowsTerminal02](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Tools/配置WindowsTerminal02.png)

点击复制，这么做的目的是为了创建一个初始化配置，并使用其中的`guid`字段。自己写的guid字段会导致WindowsTerminal无法识别guid的报错问题，使用系统生成的则不报错。

![配置WindowsTerminal03](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Tools/配置WindowsTerminal03.png)

接下来进行配置，打开JSON文件。

在`schemes`字段添加一个主题配色：

```json
{
  "background": "#283033",
  "black": "#000000",
  "blue": "#6666E9",
  "brightBlack": "#666666",
  "brightBlue": "#0000FF",
  "brightCyan": "#00E5E5",
  "brightGreen": "#00D900",
  "brightPurple": "#E500E5",
  "brightRed": "#E50000",
  "brightWhite": "#E5E5E5",
  "brightYellow": "#E5E500",
  "cursorColor": "#FFFFFF",
  "cyan": "#00A6B2",
  "foreground": "#00FF00",
  "green": "#00A600",
  "name": "Homebrew",
  "purple": "#B200B2",
  "red": "#FC5275",
  "selectionBackground": "#FFFFFF",
  "white": "#BFBFBF",
  "yellow": "#999900"
},
```

在`profiles.list`中添加PowershellCore默认配置：

注意，不要忘了这里的guid使用系统生成的。

```json
{
  "closeOnExit": "graceful",
  "colorScheme": "Homebrew", // 主题配色
  // 修改commandline路径到安装目录
  "commandline": "C:/Program Files/PowerShell/7-preview/pwsh.exe -nologo",
  "cursorColor": "#FFFFFF",
  "cursorShape": "bar",
  "elevate": true,
  "font":
  { // 下载安装的字体在这里设置
    "face": "FiraCode NF",
    "size": 11
  },
  "guid": "{574e775e-4f2a-5b96-ac1e-a2962a402336}", // guid使用系统生成的
  "hidden": false,
  "historySize": 9001,
  // 修改图标路径
  "icon": "C:/Program Files/PowerShell/7-preview/assets/Powershell_av_colors.ico",
  "name": "PowerShell Core 7.3.0",
  "opacity": 87,
  "snapOnInput": true,
  "source": "Windows.Terminal.PowershellCore",
  "startingDirectory": "D:\\Work",
  "useAcrylic": false
},
```

设置`defaultProfile`字段默为刚才添加的配置，使用的是上面配置项中的`guid`字段：

```json
{
	"defaultProfile": "{574e775e-4f2a-5b96-ac1e-a2962a402336}",
}
```

## 安装oh-my-posh

安装方法有很多，可查看[官方文档](https://ohmyposh.dev/docs/installation/windows)。

个人选择手动安装，从[Github仓库](https://github.com/jandedobbeleer/oh-my-posh)的release中找到最新的下载安装包`install-amd64.exe`点击下载。

安装完成后，打开新PowerShell窗口并输入验证是否安装成功：

```shell
> oh-my-posh --version
8.5.0
```

可在[官网查看](https://ohmyposh.dev/docs/themes)相关主题，或在窗口中输入`Get-PoshThemes`查看oh-my-posh支持的主题：

```shell
Get-PoshThemes
```

确定好自己想要的主题后，打开之前生成的文件`C:\Users\%USERNAME%\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`

这里选择的主题`powerlevel10k_lean`，粘贴`oh-my-posh`脚本到`Microsoft.PowerShell_profile.ps1`中：

```powershell {8-9}
#------------------------------- Import Modules BEGIN -------------------------------
# 引入 posh-git
Import-Module posh-git

# 引入 ps-read-line
Import-Module PSReadLine

# 引入 oh-my-posh
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH/powerlevel10k_lean.omp.json" | Invoke-Expression

#------------------------------- Import Modules END   -------------------------------
```

重启WindowsTerminal或终端中执行`. $Profile`刷新脚本文件即可看到主题效果。

## VSCode中集成

`settings.json`中配置：

```json
{
  "terminal.integrated.fontFamily": "FiraCode NF",
  "terminal.integrated.profiles.windows": {
    "pwsh7": {
      "color": "terminal.ansiGreen",
      "path": "C:\\Program Files\\PowerShell\\7-preview\\pwsh.exe",
      "args": [
        "-nologo"
      ]
    }
  },
  "terminal.integrated.defaultProfile.windows": "pwsh7",
  "terminal.integrated.cursorStyle": "line",
}
```

效果如下：

![配置WindowsTerminal04](https://cdn.jsdelivr.net/gh/ccbeango/blogImages@master/Tools/配置WindowsTerminal04.png)
