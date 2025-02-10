新建工程

![](../images/8cbd4c18934bc2ccca65faf96b5da08c.png)

选择对应的芯片型号

![](../images/7276d2eb1bea1923ee221f8a9b99ccf7.png)

点击OK之后弹出以下界面，暂时叉掉不用

![](../images/cd622d6150b01de27014dccbadacbbe3.png)

复制模板中的启动文件等文件到项目下，在项目根目录下创建`Start`目录

![](../images/9ef352157bb229efff7810af20bbce88.png)

把模板中的`STM32F10x_StdPeriph_Lib_V3.5.0\Libraries\CMSIS\CM3\DeviceSupport\ST\STM32F10x\startup\arm`目录下的所有文件

`STM32F10x_StdPeriph_Lib_V3.5.0\Libraries\CMSIS\CM3\DeviceSupport\ST\STM32F10x`目录下的

![](../images/c2031e4e87313720006ae36d95a656b5.png)

以及`STM32F10x_StdPeriph_Lib_V3.5.0\Libraries\CMSIS\CM3\CoreSupport`目录下的所有文件添加到`Start`目录下

![](../images/c5b3f9f460c46610be2ad10e1bb257e1.png)

然后进入Keil

![](../images/0c0451798e41869e974c5119425b1f9e.png)

再在`Start`上面右键

![](../images/c597e00a700a8bfe72ad22fe04fa4eed.png)

把`Strat`目录下的指定文件添加进来

![](../images/50d771d38b4d533d806fd15542c7e247.png)

接着点击

![](../images/2c940a193e712efc6b2548264d25763e.png)

![](../images/fe3cead8c29f4c2ff3ef7112e1f1117b.png)

然后把`Start`目录添加进来

![](../images/058ddbeaa83688e999d485757059661d.png)

![](../images/1d391bcad58538d42eb5c1b82d0fc6d2.png)

然后一直ok,继续在项目根目录下创建`User`目录

![](../images/98faf9687cbb89cdea5fb279fd0f2757.png)

接着在Target 1上创建新的组，改名字为User

![](../images/460cee0bdfda927a89e2d8cd4e155624.png)

然后在User下创建`main.c`文件

![](../images/35871f251681a8a07bfbc1af8aadd43c.png)

在`mian.c`文件中加入以下内容

```c
#include "stm32f10x.h"                  // Device header

int main(void)
{
	while(1)
	{
		
	}
	// 最后一行要留一行空行,不然编译器会警告
}

```

![](../images/ce1af8afe9f953df91612768f7ba2a92.png)

配置调试器

![](../images/4dbc2d62906a1891e5e803abe8c965dd.png)

![](../images/d096cc8a2097d0de3e6f4e9ae41335d8.png)

![](../images/61fb4cb1af42eabaf75d00f19e80f4f9.png)

编译然后load，灯就会熄灭了

![](../images/8c4fbff4ed8bf47bc7725bf616b4caae.png)

基于寄存器操作stm32最小单片机亮灭灯

```c
#include "stm32f10x.h"                  // Device header

int main(void)
{
	RCC->APB2ENR = 0x00000010;
	GPIOC->CRH = 0x00300000;
	// GPIOC->ODR = 0x00000000; // 亮灯
	GPIOC->ODR = 0x00002000; // 灭灯
	while(1)
	{
		
	}
}

```

基于库函数

在根目录添加`Library`文件夹

复制模板下的`STM32F10x_StdPeriph_Lib_V3.5.0\Libraries\STM32F10x_StdPeriph_Driver\src`目录和`STM32F10x_StdPeriph_Lib_V3.5.0\Libraries\STM32F10x_StdPeriph_Driver\inc`目录下的所有文件到刚刚创建的`Library`目录下

![](../images/a895870cc24ee0ebd2e2ee88cb88a06b.png)

然后在Keil中新建`Library`组然后添加`Library`目录下的所有文件

![](../images/1d4c25a6abecab6792d50e8d2265dd8f.png)

然后把`STM32F10x_StdPeriph_Lib_V3.5.0\Project\STM32F10x_StdPeriph_Template`目录下指定的3个文件复制到`User`目录下

![](../images/316828457790be72ed88ccd038432d78.png)

然后再在Keil里的User把对应的文件加进来

![](../images/01cfb7ddaa1a3628253ffb2b0da3fe53.png)

需要配置`USE_STDPERIPH_DRIVER`才能使用`stm32f10x_conf.h`

![](../images/61fe35b9c409a7182316985f5274628b.png)

配置

![](../images/97915edb803c5a63080d037a4a4e5338.png)

使用库开发

```c
#include "stm32f10x.h"                 

int main(void)
{
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOC, ENABLE);
	GPIO_InitTypeDef GPIO_InitStructure;
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_Out_PP;
	GPIO_InitStructure.GPIO_Pin = GPIO_Pin_13;
	GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
	GPIO_Init(GPIOC, &GPIO_InitStructure);
	// GPIO_SetBits(GPIOC, GPIO_Pin_13); // 关灯
	GPIO_ResetBits(GPIOC, GPIO_Pin_13); // 开灯
	while(1)
	{
		
	}
}

```

编译报错的话，把C99 Mode勾选上`<font style="color:rgb(89, 97, 114);">c99 mode: 定义变量的位置可以不设置在开头，定义在任意位置</font>`

![](../images/71617b98cc46cc3ec5e3959466b953be.png)





