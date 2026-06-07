---
title: 使用 archinstall 安装 Arch Linux 和 KDE 桌面环境
date: 2022-05-02T00:00:00.000+00:00
tags:
  - arch linux
  - archinstall
cover: https://s.bh.sb/images/archlinux-archinstall.webp
---

本文将指导使用 archinstall 安装 Arch Linux 和 KDE 桌面环境。

## 前言

众所周知，[安装 Arch Linux](https://wiki.archlinux.org/title/Installation_guide_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)) 是一件非常复杂并痛苦的事情，您需要一定的 Linux 基础，然后使用命令行进行硬盘分区，安装自己需要的软件，Arch Linux 官方也并未提供 GUI 安装程序，所以很多想尝试 Arch Linux 的用户都会被劝退在安装这一步骤上。

[archinstall](https://github.com/archlinux/archinstall) 是一个 Python 写的 Arch Linux [安装向导程序](https://wiki.archlinux.org/title/Archinstall)，我们可以很方便地使用 `archinstall` 安装 Arch Linux。

Arch Linux 发布 2022.05.01 的 iso 后，已经默认集成了 `archinstall`，于是您可以参考本教程无痛安装 Arch Linux，为了方便期间，本教程的安装是基于 `VMware Workstation`，理论上和你本地挂载 ISO 安装并无区别。

## 准备工作

首先，获取安装映像，您可以在[下载页面](https://archlinux.org/download/)下载最新的 iso 镜像文件，您可以选择速度最快的 mirror 进行下载，这里推荐两个下载链接

国外用户，使用官方的镜像：

[https://mirror.pkgbuild.com/iso/latest/archlinux-x86_64.iso](https://mirror.pkgbuild.com/iso/latest/archlinux-x86_64.iso)

国内用户，使用清华大学的镜像：

[https://mirrors.tuna.tsinghua.edu.cn/archlinux/iso/latest/archlinux-x86_64.iso](https://mirrors.tuna.tsinghua.edu.cn/archlinux/iso/latest/archlinux-x86_64.iso)

下载后您需要准备个 U 盘或移动硬盘，然后使用一些工具，比如 [Rufus](https://rufus.ie/zh/)，这里不再阐述，其他方法请参考[这里](https://wiki.archlinux.org/title/USB_flash_installation_medium_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))。

*另外，您需要确认主板 BIOS 里没有奇奇怪怪的设置，比如某些针对 Windows 系统的设置，比如快速启动、CSM 安全启动、TPM 模块等都设置需要自己调整，否则默认配置可能会导致安装完 Arch Linux 后无法进入系统引导。*

## 安装 Arch Linux 系统

启动进入引导后，我们会看到熟悉的 Arch Linux 界面：

![烧饼博客](https://s.bh.sb/images/arch/1.png)

默认进入后即可看到 Live CD 已经正常工作：

![烧饼博客](https://s.bh.sb/images/arch/2.png)

我们可以运行 `installation_guide` 命令查看安装文档，当然都是英文的，对英语不好的朋友也可以直接参考[中文的文档说明](https://wiki.archlinux.org/title/Installation_guide_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))：

![烧饼博客](https://s.bh.sb/images/arch/3.png)

![烧饼博客](https://s.bh.sb/images/arch/4.png)

按 `Q` 退出，我们可以直接运行 `archinstall` 进行图形化安装向导：

![烧饼博客](https://s.bh.sb/images/arch/5.png)

然后我们会看到 `archinstall` 的向导界面：

![烧饼博客](https://s.bh.sb/images/arch/6.png)

目前我们能看到的选项有：

```bash
Select Archinstall language
Select keyboard layout
Select mirror region
Select harddrives
Select bootloader
Use swap
Specify hostname
Set root password
Specify superuser account
Specify user account
Specify profile
Select audio
Select kernels
Additional packages to install
Configure network
Select timezone
Set automatic time sync (NTP)
Additional repositories to enable
```
然后我们就一步一步来安装：

`Select Archinstall language` 这里可以选择 `archinstall` 的界面语言，很可惜，截止本文发布，并没有中文。

`Select keyboard layout` 选择键盘布局，默认情况你的键盘布局应该都是 `us`，除非你是德国等国家的用户，那么请自行选择。

`Select mirror region` 可以选择最合适的镜像，建议选择和您当前网络一致的国家或地区：

![烧饼博客](https://s.bh.sb/images/arch/7.png)

记得按空格选择，然后按回车继续。

`Select harddrives` 可以选择安装的硬盘，请自行选择需要安装的硬盘，切记看清楚硬盘大小，不要装错了硬盘最后拍大腿：

![烧饼博客](https://s.bh.sb/images/arch/8.png)

选择硬盘后会让您选择如何分区，如果没有特殊需求，直接选择 `Wipe all selected drives and use a best-effort default partition layout`，这样会把你的硬盘全部格式化，切记备份重要数据，不然安装了以后拍大腿：

![烧饼博客](https://s.bh.sb/images/arch/9.png)

然后会询问您硬盘分区格式，可选 `btrfs`，`ext4`，`f2fs` 或 `xfs`，如果没有特殊需求，可以选最常用的 `ext4`：

![烧饼博客](https://s.bh.sb/images/arch/10.png)

然后会询问您是否要对 `/home` 目录单独分区，这里主要存放用户的数据，默认建议单独分区，实际操作中会分配大概 80% 的硬盘空间给 `/home` 目录，你也可以一股脑都分给 `/`，请自行决定：

![烧饼博客](https://s.bh.sb/images/arch/11.png)

完成后会多出一个 `Set encryption password` 选项，如果您需要对硬盘加密，可以选择，如果没需要可以跳过。

![烧饼博客](https://s.bh.sb/images/arch/12.png)

然后我们直接跳过 `Select bootloader` 和 `Use swap`，因为他已经自动给您设置好了，然后如果您喜欢的话，可以给您的机器设置一个 `hostname` 和 `root` 密码，如果没有特殊需求，也可以跳过 `Specify hostname` 和 `Set root password`，我们直接来到 `Specify superuser account`，设置一个拥有 `sudo` 权限的超级用户，这个用户是日常登录和操作使用，请务牢记用户名和密码：

![烧饼博客](https://s.bh.sb/images/arch/13.png)

输入用户名：

![烧饼博客](https://s.bh.sb/images/arch/14.png)

输入密码，Linux 终端下输入密码是不显示的，不要以为自己产生幻觉输错了：

![烧饼博客](https://s.bh.sb/images/arch/15.png)

可能会提示您的密码太弱，自行斟酌是否需要修改：

![烧饼博客](https://s.bh.sb/images/arch/16.png)

然后再输入一次密码进行验证：

![烧饼博客](https://s.bh.sb/images/arch/17.png)

成功后选择 `Confirm and exit` 即可：

![烧饼博客](https://s.bh.sb/images/arch/18.png)

然后我们也可以跳过其他选项，直接来到 `Configure network`：

![烧饼博客](https://s.bh.sb/images/arch/19.png)

因为我们希望安装 KDE 桌面环境，所以选择 `Use NetworkManager`：

![烧饼博客](https://s.bh.sb/images/arch/20.png)

如果是服务器环境，可以选择 `Manual configuration` 手工配置网络。

然后我们选择时区，进入 `Select timezone`：

![烧饼博客](https://s.bh.sb/images/arch/21.png)

按照您本地的时区来选择，可以使用 `/` 然后输入前几个字符快速搜索，比如 `/shanghai`：

![烧饼博客](https://s.bh.sb/images/arch/22.png)

一切准备就绪，我们可以选择 `Save configuration` 来保存配置，也可以直接选 `Install` 进行安装：

![烧饼博客](https://s.bh.sb/images/arch/23.png)

![烧饼博客](https://s.bh.sb/images/arch/24.png)

![烧饼博客](https://s.bh.sb/images/arch/25.png)

系统会提示 `Would you like to chroot into the newly created installation and perform post-installation configuration?`，这里我们直接选择 `Yes`，然后进入安装：

![烧饼博客](https://s.bh.sb/images/arch/26.png)

霹雳哗啦安装完毕后，我们可以安装一些常用的软件，比如 `KDE` 桌面环境：

`pacman -S plasma-meta plasma`
没有特殊需求都选择默认一路回车即可：

![烧饼博客](https://s.bh.sb/images/arch/27.png)

![烧饼博客](https://s.bh.sb/images/arch/28.png)

安装 KDE 比较慢，因为软件包较大，请耐心等待安装完成。

安装完成后开启 `sddm`：

`systemctl enable sddm`
然后我们使用 `exit` 命令退出并使用 `reboot` 命令重启：

![烧饼博客](https://s.bh.sb/images/arch/29.png)

## 安装并配置 Arch Linux 的软件

重启后我们就可以看到熟悉的登录界面啦：

![烧饼博客](https://s.bh.sb/images/arch/30.png)

登录后会发现除了个桌面啥东西都没有，此时我们可以按键盘 `CTRL` + `ALT` + `F2` 进入 `tty2` 终端：

![烧饼博客](https://s.bh.sb/images/arch/31.png)

输入用户名和密码登录：

![烧饼博客](https://s.bh.sb/images/arch/32.png)

然后开始安装一些常用软件，比如 KDE 的终端软件 Konsole 和文本编辑器 Kate：

`sudo pacman -S konsole kate`
![烧饼博客](https://s.bh.sb/images/arch/33.png)

安装完成后，我们可以按键盘 `CTRL` + `ALT` + `F1` 重新进入 KDE 桌面环境，然后按 `Win` 键搜索 `konsole` 进入终端：

![烧饼博客](https://s.bh.sb/images/arch/34.png)

这里推荐一些常规和必要的软件包：

如果您是 Intel 的 CPU：

`sudo pacman -S intel-ucode`
如果您是 AMD 的 CPU：

`sudo pacman -S amd-ucode`
如果您是 AMD 的 GPU：

`sudo pacman -S xf86-video-amdgpu mesa`
如果您是 NVIDIA 的 GPU：

`sudo pacman -S nvidia mesa`
如果您是 Intel 的 GPU：

`sudo pacman -S xf86-video-intel mesa`
关于 Arch Linux 下 GPU 配置可以参考[这里](https://wiki.archlinux.org/title/Xorg#Driver_installation)和[这里](https://wiki.archlinux.org/title/AMDGPU)。

然后安装一些常见的工具包：

`sudo pacman -S inetutils iproute2 iputils procps-ng psmisc sysfsutils which wget nano vim sudo unzip mtr traceroute dnsutils lsb-release ca-certificates bash-completion logrotate openssh less rsync`
部分软件是需要自行开启并设置开机自启动的，比如 `OpenSSH`：

`systemctl enable --now sshd`
然后安装个浏览器，Linux 下还是推荐用 `Firefox`：

`sudo pacman -S firefox`
安装完成后可以然后按 `Win` 键搜索 `firefox` 并右键图标使用 `Add to Desktop` 创建桌面快捷方式：

![烧饼博客](https://s.bh.sb/images/arch/35.png)

此时桌面上就有 `Firefox` 的图标啦：

![烧饼博客](https://s.bh.sb/images/arch/36.png)

## 解决中文显示乱码问题

我们会遇到一个问题，此时打开中文网页都是乱码：

![烧饼博客](https://s.bh.sb/images/arch/37.png)

而且网页里包含的 Emoji 🤣 也是一个个方框哦，所以我们参考[这里](https://wiki.archlinux.org/title/Localization_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)/Simplified_Chinese_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))和[这里](https://wiki.archlinux.org/title/fonts#Emoji_and_symbols)，首先安装字体包：

`sudo pacman -S noto-fonts noto-fonts-cjk noto-fonts-emoji`
然后使用 `Konsole` 创建一个 `.config/fontconfig/fonts.conf` 文件

```bash
cd ~
mkdir -p .config/fontconfig
vim .config/fontconfig/fonts.conf
```
复制以下内容，使用 `vim` 编辑文件，按 `i` 开始编辑，按 `Ctrl + Shift + V` 或 `Shift + Insert` 或直接在 Konsole 里右键 `Paste`，然后粘贴以下内容后，完成后按 `ESC` 键，然后输入 `:wq` 完成编辑：

```bash
<?xml version='1.0' encoding='UTF-8'?>
<!DOCTYPE fontconfig SYSTEM 'urn:fontconfig:fonts.dtd'>
<!-- ${XDG_CONFIG_HOME}/fontconfig/fonts.conf
        - vim:ft=xml:fenc=utf-8:noet:ts=3:sw=3:
        -->
<fontconfig>
 <alias>
  <family>serif</family>
  <prefer>
   <family>Noto Serif</family>
   <family>Noto Color Emoji</family>
   <family>Noto Sans CJK SC</family>
   <family>Noto Sans CJK TC</family>
   <family>Noto Sans CJK JP</family>
  </prefer>
 </alias>
 <alias>
  <family>sans-serif</family>
  <prefer>
   <family>Noto Sans</family>
   <family>Noto Color Emoji</family>
   <family>Noto Sans CJK SC</family>
   <family>Noto Sans CJK TC</family>
   <family>Noto Sans CJK JP</family>
  </prefer>
 </alias>
 <alias>
  <family>monospace</family>
  <prefer>
   <family>Noto Sans Mono</family>
   <family>Noto Color Emoji</family>
   <family>Noto Sans Mono CJK SC</family>
   <family>Noto Sans Mono CJK TC</family>
   <family>Noto Sans Mono CJK JP</family>
  </prefer>
 </alias>
 <match target="font">
  <edit mode="assign" name="antialias">
   <bool>true</bool>
  </edit>
  <edit mode="assign" name="autohint">
   <bool>true</bool>
  </edit>
  <edit mode="assign" name="dpi">
   <double>96</double>
  </edit>
  <edit mode="assign" name="hinting">
   <bool>true</bool>
  </edit>
  <edit mode="assign" name="hintstyle">
   <const>hintslight</const>
  </edit>
  <edit mode="assign" name="lcdfilter">
   <const>lcdlight</const>
  </edit>
  <edit mode="assign" name="rgba">
   <const>rgb</const>
  </edit>
  <edit mode="assign" name="size">
   <int>15</int>
  </edit>
 </match>
 <dir>~/.fonts</dir>
</fontconfig>
```
然后清理字体缓存：

`fc-cache -fv`
清理完事后会提示 `fc-cache: succeeded`，然后我们使用 `fc-match -s | grep 'Noto Sans CJK'` 命令查看中文字体是否生效：

![烧饼博客](https://s.bh.sb/images/arch/38.png)

然后重新登录用户，或者直接 `sudo reboot` 重启电脑，再次打开 `Firefox` 即可看到中文字体完美显示：

![烧饼博客](https://s.bh.sb/images/arch/39.png)

## 安装中文输入法

参考[这里](https://wiki.archlinux.org/title/Fcitx5_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))，我们直接安装 `fcitx5`：

`sudo pacman -S fcitx5-im fcitx5-qt fcitx5-gtk fcitx5-chinese-addons fcitx5-pinyin-zhwiki`
然后修改全局变量环境文件

`sudo vim /etc/environment`
加入以下内容：

```bash
GTK_IM_MODULE=fcitx
QT_IM_MODULE=fcitx
XMODIFIERS=@im=fcitx
INPUT_METHOD=fcitx
SDL_IM_MODULE=fcitx
GLFW_IM_MODULE=ibus
```
重启后即可生效，在 KDE 里按 `Win` 键搜索 `Input Method` 后进入 `Input Method` 即可配置输入法：

![烧饼博客](https://s.bh.sb/images/arch/40.png)

选择 `Input Method`，然后点击 `Add Input Method...`：

![烧饼博客](https://s.bh.sb/images/arch/41.png)

搜索 `pinyin` 然后添加 `简体中文` 下的 `Pinyin`：

![烧饼博客](https://s.bh.sb/images/arch/42.png)

点击 `Add` 后记得点击 `Apply` 生效，然后我们可以看到任务栏右下角的键盘图标，右键即可看到 `Pinyin` 输入法，可以点击 `restart` 生效任何修改的配置：

![烧饼博客](https://s.bh.sb/images/arch/43.png)

第一次打开拼音输入法会提示你是否需要开启云拼音预测，可以按照自己的喜好选择：

![烧饼博客](https://s.bh.sb/images/arch/44.png)

然后我们随便打开一个文本编辑器，按 `Ctrl` + `空格` 即可开启拼音输入法：

![烧饼博客](https://s.bh.sb/images/arch/45.png)

## 配置第三方源

Arch Linux 官方提供了一些第三方源，这里我们推荐 [AUR](https://aur.archlinux.org/) 和 [Archlinuxcn](https://www.archlinuxcn.org/)

安装 AUR 的包管理助手 [yay](https://github.com/Jguer/yay)：

```bash
sudo pacman -S base-devel git
cd ~
mkdir -p .local
mkdir -p .local/opt
cd .local/opt
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si
```
*国内网络的用户可能无法流畅安装编译 yay，需要一些魔法操作，请自行解决。*

也可以直接安装打包好的二进制包：

```bash
sudo pacman -S git base-devel
cd ~
mkdir -p .local
mkdir -p .local/opt
cd .local/opt
git clone https://aur.archlinux.org/yay-bin.git
cd yay-bin
makepkg -si
```
然后即可使用 `yay -S` 来安装 `AUR` 中的软件，比如安装 `Microsoft Edge` 浏览器：

`yay -S microsoft-edge-stable-bin`
没有特殊需求的话一路回车即可安装。

也可以使用 `yay -Syu` 直接更新系统和 AUR 仓库里的软件：

`yay -Syu`
添加 `Archlinuxcn` 源：

修改 `/etc/pacman.conf` 文件，加入：

```bash
[archlinuxcn]
Server = https://repo.archlinuxcn.org/$arch
```
国内网络用户可以使用清华大学的源：

```bash
[archlinuxcn]
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/$arch
```
然后更新系统并安装 `archlinuxcn-keyring` 包：

```bash
sudo pacman -Syu
sudo pacman -S archlinuxcn-keyring
```
如果遇到类似这样的错误提示：

```bash
gpg: key B3D53065DB03D61E was created 10631 seconds in the future (time warp or clock problem)
==> Appending keys from archlinuxcn.gpg...
gpg: key B3D53065DB03D61E was created 10631 seconds in the future (time warp or clock problem)
gpg: key B3D53065DB03D61E was created 10631 seconds in the future (time warp or clock problem)
gpg: key B3D53065DB03D61E was created 10631 seconds in the future (time warp or clock problem)
gpg: key B3D53065DB03D61E was created 10631 seconds in the future (time warp or clock problem)
gpg: key B3D53065DB03D61E was created 10631 seconds in the future (time warp or clock problem)
gpg: key B3D53065DB03D61E was created 10630 seconds in the future (time warp or clock problem)
gpg: key B3D53065DB03D61E was created 10630 seconds in the future (time warp or clock problem)
gpg: key B3D53065DB03D61E was created 10630 seconds in the future (time warp or clock problem)
gpg: key B3D53065DB03D61E was created 10630 seconds in the future (time warp or clock problem)
gpg: key B3D53065DB03D61E was created 10630 seconds in the future (time warp or clock problem)
gpg: key B3D53065DB03D61E was created 10630 seconds in the future (time warp or clock problem)
gpg: key B3D53065DB03D61E was created 10630 seconds in the future (time warp or clock problem)
gpg: key B3D53065DB03D61E was created 10630 seconds in the future (time warp or clock problem)
gpg: key B3D53065DB03D61E was created 10630 seconds in the future (time warp or clock problem)
gpg: key B3D53065DB03D61E was created 10630 seconds in the future (time warp or clock problem)
gpg: key B3D53065DB03D61E was created 10630 seconds in the future (time warp or clock problem)
gpg: key B3D53065DB03D61E was created 10630 seconds in the future (time warp or clock problem)
```
说明你本地的系统时间没有和 NTP 服务器同步，我们可以手工打开：

```bash
sudo timedatectl set-ntp 1
sudo timedatectl status
```
然后删除旧的 GPG Key 缓存文件并重新生成：

```bash
sudo rm -fr /etc/pacman.d/gnupg
sudo pacman-key --init
sudo pacman-key --populate
```
然后重新安装 `archlinuxcn-keyring` 即可正常工作。

*请注意 AUR 里的很多软件分两种发布形式，一种是带 -bin 结尾的二进制包，安装后直接可用，一种是不带的，就是从源码编译安装，本地不一定能装的上，请自行选择。*

## 参考教程

本教程仅适合有一定 Linux 基础和动手能力的小伙伴，如果您想从头开始学习安装一个 Arch Linux，那么这两个教程一定很适合您学习

- [以官方 Wiki 的方式安装 ArchLinux](https://www.viseator.com/2017/05/17/arch_install/)

- [Arch Linux 安装使用教程 - ArchTutorial - Arch Linux Studio](https://archlinuxstudio.github.io/ArchLinuxTutorial/)

## 推荐软件

- [Firefox](https://archlinux.org/packages/extra/x86_64/firefox/)

- [Thunderbird](https://archlinux.org/packages/extra/x86_64/thunderbird/)

- [VSCodium](https://aur.archlinux.org/packages/vscodium-bin)

- [Typora](https://github.com/archlinuxcn/repo/tree/master/archlinuxcn/typora)

- [Github Desktop](https://aur.archlinux.org/packages/github-desktop-bin)

- [1Password](https://aur.archlinux.org/packages/1password)

- [Microsoft Edge](https://aur.archlinux.org/packages/microsoft-edge-stable-bin)

- [Chromium](https://archlinux.org/packages/extra/x86_64/chromium/)

最后秀一下我的 Arch Linux：

![image.png](https://s.bh.sb/uploads/2022/05/16/tqA6ZHukDrvi9cg.png)

本文短网址：[https://z.sh/tf63Y](https://z.sh/tf63Y)