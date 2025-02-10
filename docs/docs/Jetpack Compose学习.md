## 使用`@Composable`注解的方法标识该方法是组件
```kotlin
@Composable
fun SearchBar(
    modifier: Modifier = Modifier
) {}
```

## 使用`@Preview`和`@Composable`注解的方法可以在ide的预览界面预览样式
```kotlin
@Preview(name = "白天主题")
@Preview(
    name = "夜间主题",
    uiMode = Configuration.UI_MODE_NIGHT_YES,
    showBackground = true
)
@Composable
fun PreviewMessageCard() {}
```

## 对齐方式
> <font style="color:rgb(78, 82, 86);">一般来说，若要对齐父容器中的可组合项，应设置该父容器的</font>**<font style="color:rgb(78, 82, 86);">对齐方式</font>**<font style="color:rgb(78, 82, 86);">。因此，应告知父项如何对齐其子项，而不是告知子项将其自身放置在父项中。对于 </font><font style="background-color:rgb(232, 234, 237);">Column</font><font style="color:rgb(78, 82, 86);">，可以决定其子项的水平对齐方式。具体选项包括：Start、CenterHorizontally、End，对于 </font><font style="background-color:rgb(232, 234, 237);">Row</font><font style="color:rgb(78, 82, 86);">，您可以设置垂直对齐。具体选项类似于 </font><font style="background-color:rgb(232, 234, 237);">Column</font><font style="color:rgb(78, 82, 86);"> 的选项：Top、CenterVertically、Bottom，对于 </font><font style="background-color:rgb(232, 234, 237);">Box</font><font style="color:rgb(78, 82, 86);">，您可以同时使用水平对齐和垂直对齐。具体选项包括：TopStart、TopCenter、TopEnd、CenterStart、Center、CenterEnd、BottomStart、BottomCenter、BottomEnd，容器的所有子项都将遵循这一相同的对齐模式。可以通过向单个子项添加 </font>[align](https://developer.android.com/reference/kotlin/androidx/compose/foundation/layout/ColumnScope?hl=zh-cn#(androidx.compose.ui.Modifier).align(androidx.compose.ui.Alignment.Horizontal))<font style="color:rgb(78, 82, 86);"> 修饰符来替换其行为。</font>
>

```kotlin
Column(
    modifier = modifier,
    // 水平居中
    horizontalAlignment = Alignment.CenterHorizontally 
) 
```

使用`@DrawableRes`注解标记`R.drawable`下的文件id

使用`@StringRes`注解标记`R.string`下的标签id

```kotlin
@DrawableRes image: Int
@StringRes content: Int
```

## 插槽
```kotlin
@Composable
fun HomeSection(
    title: String,
    modifier: Modifier = Modifier,
    // 组件放到最后面就可使用尾随 lambda 填充内容槽位
    content: @Composable () -> Unit
) {
    Column(modifier) {
        Text(text = title)
        content()
    }
}

@Preview
@Composable
fun ShowHomeSection() {
    StudyTheme {
        HomeSection("标题") {
            AlignYourBodyElement(
                image = R.drawable.ic_launcher_background,
                content = R.string.app_name
            )
        }
    }
}
```

## 给`Column`加上上下滚动
```kotlin
Column(
        modifier
            .verticalScroll(rememberScrollState())
    )
```

## 预览加上背景颜色和高度
```kotlin
@Preview(
    showBackground = true,
    backgroundColor = 0xFFF5F0EE,
    heightDp = 180
)
```

## 底部导航栏实现
`NavigationBar`是导航栏

`NavigationBarItem`是导航栏上的菜单选项

```kotlin
@Composable
fun SootheBottomNavigation(modifier: Modifier = Modifier) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surfaceVariant,
        modifier = modifier
    ) {
        NavigationBarItem(
            selected = true,
            onClick = { },
            label = {
                Text(text = "发送")
            },
            icon = {
                Icon(
                    imageVector = Icons.Default.Send,
                    contentDescription = null
                )
            })
        NavigationBarItem(
            selected = true,
            onClick = { },
            label = {
                Text(text = "电话")
            },
            icon = {
                Icon(
                    imageVector = Icons.Default.Call,
                    contentDescription = null
                )
            })
    }
}
```

## 使用`Scaffold`的`bottomBar`可以设置底部导航栏
```kotlin
@Composable
fun MySootheAppPortrait() {
    StudyTheme {
        Scaffold(
            bottomBar = { SootheBottomNavigation() }
        ) { padding ->
            HomeScreen(Modifier.padding(padding))
        }
    }
}
```

## compose响应式变量书写的2种方式
```kotlin
val count: MutableState<Int> = remember { mutableStateOf(0) }
// 需要导入,如果要需改就不能用val关键字
// import androidx.compose.runtime.setValue
// import androidx.compose.runtime.getValue
var count by remember { mutableStateOf(0) } 
```

 `remember`可以在重组后保持状态，但不会在配置更改后保持状态，所以必须使用 `rememberSaveable`，而不是`remember`

```kotlin
var count by rememberSaveable { mutableIntStateOf(0) }
```

## ViewModel的使用
需要在`app/build.gradle.kts 文件`中添加以下库，并在 Android Studio 中同步新的依赖项

版本在[https://developer.android.com/jetpack/androidx/releases/lifecycle?hl=zh-cn](https://developer.android.com/jetpack/androidx/releases/lifecycle?hl=zh-cn)处查看

```kotlin
implementation("androidx.lifecycle:lifecycle-viewmodel-compose:{latest_version}")
```

```kotlin
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.toMutableStateList
import androidx.lifecycle.ViewModel

/**
 * 如果是普通类型无法追踪变化更新界面，所以需要变成可以追踪的
 * 让类在构造函数中接收默认值为 false 的 initialChecked 变量
 * 然后可以使用工厂方法 mutableStateOf 来初始化 checked 变量并接受 initialChecked 作为默认值
 */
class WellnessTask(val id: Int, val label: String, initialChecked: Boolean = false) {
    var checked by mutableStateOf(initialChecked)
}

class WellnessViewModel : ViewModel() {
    private val _tasks = getWellnessTasks().toMutableStateList()
    val tasks: List<WellnessTask> get() = _tasks

    fun remove(item: WellnessTask) {
        _tasks.remove(item)
    }

    fun changeTaskChecked(item: WellnessTask, checked: Boolean) {
        _tasks.find { it.id == item.id }?.let { task -> task.checked = checked }
    }
}

private fun getWellnessTasks() = List(30) { i -> WellnessTask(i, "任务 $i") }
```

<font style="background-color:rgb(232, 234, 237);">viewModel()</font><font style="color:rgb(78, 82, 86);"> 会返回一个现有的 </font><font style="background-color:rgb(232, 234, 237);">ViewModel</font><font style="color:rgb(78, 82, 86);">，或在给定作用域内创建一个新的 ViewModel。只要作用域处于活动状态，ViewModel 实例就会一直保留。例如，如果在某个 activity 中使用了可组合函数，则在该 activity 完成或进程终止之前，</font><font style="background-color:rgb(232, 234, 237);">viewModel()</font><font style="color:rgb(78, 82, 86);"> 会返回同一实例。</font>

```kotlin
@Composable
fun WellnessScreen(
    modifier: Modifier = Modifier,
    wellnessViewModel: WellnessViewModel = viewModel()
) {
    Column(modifier = modifier) {
        StatefulCounter()
        WellnessTasksList(
            list = wellnessViewModel.tasks,
            onCheckedTask = { task, checked ->
                wellnessViewModel.changeTaskChecked(task, checked)
            },
            onCloseTask = { task ->
                wellnessViewModel.remove(task)
            }
        )
    }
}
```

## 启动页面
```kotlin
@Composable
fun LoadingView(
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        val close by rememberUpdatedState(onClose)
        LaunchedEffect(Unit) {
            delay(1000)
            close()
        }
        Column(
            modifier = modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Image(
                painter = painterResource(id = R.drawable.qidong),
                contentDescription = "登录页面图片",
                contentScale = ContentScale.FillHeight
            )
            Spacer(modifier = modifier.padding(all = 20.dp))
            Text(text = "欢迎...")
        }

    }
}
```

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            StudyTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    var showLandingScreen by remember {
                        mutableStateOf(true)
                    }
                    if (showLandingScreen) {
                        LoadingView(onClose = { showLandingScreen = false })
                    } else {
                        AppView(this)
                    }
                }
            }
        }
    }
}
```

## 使用Toast
```kotlin
fun AppView(
    context: Activity, // 把activity传递过来
    modifier: Modifier = Modifier
) {
    //...
    Toast.makeText(context, "弹出消息", Toast.LENGTH_SHORT).show()
}
```

## 动态获取权限
```kotlin
import androidx.compose.runtime.mutableStateListOf
import androidx.lifecycle.ViewModel

class MainViewModel : ViewModel() {
    val visiblePermissionDialogQueue = mutableStateListOf<String>()

    fun dismissDialog() {
        visiblePermissionDialogQueue.removeFirst()
    }

    fun onPermissionResult(
        permission: String,
        isGranted: Boolean
    ) {
        if (!isGranted && !visiblePermissionDialogQueue.contains(permission)) {
            visiblePermissionDialogQueue.add(permission)
        }
    }
}
```

```kotlin
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import kotlin.reflect.KFunction0

@Composable
fun PermissionDialog(
    permissionTextProvider: PermissionTextProvider,
    isPermanentlyDeclined: Boolean,
    onDismiss: () -> Unit,
    onOkClick: () -> Unit,
    onGoToAppSettingsClick: KFunction0<Unit>,
    modifier: Modifier = Modifier
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
//            Button(onClick = onOkClick) {
//                Text(text = "不给权限")
//            }
        },
        dismissButton = {
            Button(onClick = onGoToAppSettingsClick) {
                Text(text = "打开设置")
            }
        },
        title = {
            Text(text = "请求权限")
        },
        text = {
            Text(text = permissionTextProvider.getDescription(isPermanentlyDeclined = isPermanentlyDeclined))
        },
        modifier = modifier
    )
}

interface PermissionTextProvider {
    fun getDescription(isPermanentlyDeclined: Boolean): String
}

class CameraPermissionTextProvider : PermissionTextProvider {
    override fun getDescription(isPermanentlyDeclined: Boolean): String {
        return if (isPermanentlyDeclined) {
            "你需要打开设置,给予软件相机权限"
        } else {
            "该软件需要相机权限"
        }
    }
}

class RecordAudioPermissionTextProvider : PermissionTextProvider {
    override fun getDescription(isPermanentlyDeclined: Boolean): String {
        return if (isPermanentlyDeclined) {
            "你需要打开设置,给予软件麦克风权限"
        } else {
            "该软件需要麦克风权限"
        }
    }
}

class PhoneCallPermissionTextProvider : PermissionTextProvider {
    override fun getDescription(isPermanentlyDeclined: Boolean): String {
        return if (isPermanentlyDeclined) {
            "你需要打开设置,给予软件电话权限"
        } else {
            "该软件需要电话权限"
        }
    }
}
```

```kotlin
import android.Manifest
import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.da.study.ui.theme.StudyTheme

class MainActivity : ComponentActivity() {

    //    需要的多个权限
    private val permissionsToRequest = arrayOf(
        Manifest.permission.CALL_PHONE,
        Manifest.permission.RECORD_AUDIO
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            StudyTheme {
                Column {
                    val viewModel = viewModel<MainViewModel>()
                    val dialogQueue = viewModel.visiblePermissionDialogQueue

                    // 单个权限
                    val cameraPermissionResultLauncher = rememberLauncherForActivityResult(
                        contract = ActivityResultContracts.RequestPermission(),
                        onResult = { isGranted ->
                            viewModel.onPermissionResult(
                                permission = Manifest.permission.CAMERA,
                                isGranted = isGranted
                            )
                        }
                    )
                    // 多个权限
                    val multiplePermissionResultLauncher = rememberLauncherForActivityResult(
                        contract = ActivityResultContracts.RequestMultiplePermissions(),
                        onResult = { perms ->
                            permissionsToRequest.forEach { permission ->
                                viewModel.onPermissionResult(
                                    permission = permission,
                                    isGranted = perms[permission] == true
                                )
                            }
                        }
                    )
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Button(onClick = {
                            cameraPermissionResultLauncher.launch(
                                Manifest.permission.CAMERA
                            )
                        }) {
                            Text(text = "请求单个权限")
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = {
                            multiplePermissionResultLauncher.launch(permissionsToRequest)
                        }) {
                            Text(text = "请求多个权限")
                        }
                    }
                    dialogQueue
                        .reversed()
                        .forEach { permission ->
                            PermissionDialog(
                                permissionTextProvider = when (permission) {
                                    Manifest.permission.CAMERA -> {
                                        CameraPermissionTextProvider()
                                    }

                                    Manifest.permission.RECORD_AUDIO -> {
                                        RecordAudioPermissionTextProvider()
                                    }

                                    Manifest.permission.CALL_PHONE -> {
                                        PhoneCallPermissionTextProvider()
                                    }

                                    else -> return@forEach
                                },
                                isPermanentlyDeclined = !shouldShowRequestPermissionRationale(
                                    permission
                                ),
                                onDismiss = viewModel::dismissDialog,
                                onOkClick = {
                                    viewModel.dismissDialog()
                                    multiplePermissionResultLauncher.launch(
                                        arrayOf(permission)
                                    )
                                },
                                onGoToAppSettingsClick = ::openAppSettings
                            )
                        }
                }
            }
        }
    }
}

fun Activity.openAppSettings() {
    Intent(
        Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
        Uri.fromParts("package", packageName, null)
    ).also(::startActivity)
}
```

