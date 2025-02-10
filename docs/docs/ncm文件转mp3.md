<font style="color:rgb(31, 35, 40);">NCM格式是网易云音乐特有的音乐格式,这种音乐格式用到AES,RC4的加密算法对普通的音乐格式(如MP3,FLAC)进行加密</font>

<font style="color:rgb(31, 35, 40);">NCM格式加密过程</font>

| <font style="color:rgb(31, 35, 40);">信息</font> | <font style="color:rgb(31, 35, 40);">大小</font> | <font style="color:rgb(31, 35, 40);">备注</font> |
| --- | --- | --- |
| <font style="color:rgb(31, 35, 40);">Magic Header</font> | <font style="color:rgb(31, 35, 40);">10 bytes</font> | <font style="color:rgb(31, 35, 40);">跳过</font> |
| <font style="color:rgb(31, 35, 40);">KEY Length</font> | <font style="color:rgb(31, 35, 40);">4 bytes</font> | <font style="color:rgb(31, 35, 40);">用AES128加密RC4密钥后的长度(小端字节排序,无符号整型)</font> |
| <font style="color:rgb(31, 35, 40);">KEY From AES128 Decode</font> | <font style="color:rgb(31, 35, 40);">KEY Length(其实就是128 bytes)</font> | <font style="color:rgb(31, 35, 40);">用AES128加密的RC4密钥</font><br/><font style="color:rgb(31, 35, 40);">(解密步骤:</font><br/><font style="color:rgb(31, 35, 40);">1.按字节对0x64异或</font><br/><font style="color:rgb(31, 35, 40);">2.AES解密(其中PKCS5Padding填充模式会去除末尾填充部分)</font><br/><font style="color:rgb(31, 35, 40);">3.去除前面</font><font style="color:rgb(31, 35, 40);">neteasecloudmusic</font><font style="color:rgb(31, 35, 40);">17个字节)</font> |
| <font style="color:rgb(31, 35, 40);">Mata Length</font> | <font style="color:rgb(31, 35, 40);">4 bytes</font> | <font style="color:rgb(31, 35, 40);">Mata的信息的长度(小端字节排序,无符号整型)</font> |
| <font style="color:rgb(31, 35, 40);">Mata Data(JSON)</font> | <font style="color:rgb(31, 35, 40);">Mata Length</font> | <font style="color:rgb(31, 35, 40);">JSON的格式的Mata的信息</font><br/><font style="color:rgb(31, 35, 40);">解密步骤:</font><br/><font style="color:rgb(31, 35, 40);">1.按字节对0x63异或</font><br/><font style="color:rgb(31, 35, 40);">2.去除前面</font><font style="color:rgb(31, 35, 40);">163 key(Don't modify):</font><font style="color:rgb(31, 35, 40);">22个字节</font><br/><font style="color:rgb(31, 35, 40);">3.Base64进行decode</font><br/><font style="color:rgb(31, 35, 40);">4.AES解密</font><br/><font style="color:rgb(31, 35, 40);">5.去除前面</font><font style="color:rgb(31, 35, 40);">music:</font><font style="color:rgb(31, 35, 40);">6个字节后获得JSON</font> |
| <font style="color:rgb(31, 35, 40);">CRC校验码</font> | <font style="color:rgb(31, 35, 40);">4 bytes</font> | <font style="color:rgb(31, 35, 40);">跳过</font> |
| <font style="color:rgb(31, 35, 40);">Gap</font> | <font style="color:rgb(31, 35, 40);">5 bytes</font> | <font style="color:rgb(31, 35, 40);">跳过</font> |
| <font style="color:rgb(31, 35, 40);">Image Size</font> | <font style="color:rgb(31, 35, 40);">4 bytes</font> | <font style="color:rgb(31, 35, 40);">图片大小</font> |
| <font style="color:rgb(31, 35, 40);">Image</font> | <font style="color:rgb(31, 35, 40);">Image Size</font> | <font style="color:rgb(31, 35, 40);">图片数据</font> |
| <font style="color:rgb(31, 35, 40);">Music Data</font> | <font style="color:rgb(31, 35, 40);">-</font> | <font style="color:rgb(31, 35, 40);">RC4-KSA生成s盒</font><br/><font style="color:rgb(31, 35, 40);">RC4-PRGA解密</font> |


kotlin代码解密

```kotlin
import java.io.InputStream
import java.io.OutputStream
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec
import kotlin.experimental.xor

/**
 * @time 2024/2/28 下午 12:43
 * @author da
 * ncm 转 mp3
 */

class DConv(
    private val nis: InputStream, // ncm文件输入流
    private val nos: OutputStream // mp3文件输出流
) {

    /**
     * 加密CR4密钥的密钥
     */
    private val CORE_KEY =
        byteArrayOf(0x68, 0x7A, 0x48, 0x52, 0x41, 0x6D, 0x73, 0x6F, 0x35, 0x6B, 0x49, 0x6E, 0x62, 0x61, 0x78, 0x57)

    /**
     * 转换(加密算法/加密模式/填充模式)
     */
    private val TRANSFORMATION = "AES/ECB/PKCS5Padding"

    /**
     * 加密算法
     */
    private val ALGORITHM = "AES"

    /**
     * s-box
     */
    private val box = IntArray(256)

    /**
     * CR4-KSA秘钥调度算法
     * 功能:生成s-box
     *
     * @param key 密钥
     */
    private fun KSA(key: ByteArray) {
        val len = key.size
        for (i in 0..<256) {
            box[i] = i
        }
        var j = 0
        for (i in 0..<256) {
            j = (j + box[i] + key[i % len].toInt()) and 0xff
            val swap = box[i]
            box[i] = box[j]
            box[j] = swap
        }
    }

    /**
     * CR4-PRGA伪随机数生成算法
     * 功能:加密或解密
     *
     * @param data   加密|解密的数据
     * @param len 数据长度
     */
    private fun PRGA(data: ByteArray, len: Int) {
        for (k in 0..<len) {
            val i = (k + 1) and 0xff
            val j = (box[i] + i) and 0xff
            data[k] = data[k] xor box[(box[i] + box[j]) and 0xff].toByte()
        }
    }

    /**
     * 获取长度
     * 将用小端字节排序,无符号整型 4 字节的长度信息转换为十进制数
     *
     * @param bytes 长度信息的字节数组
     * @return 长度
     */
    private fun getLength(bytes: ByteArray): Int {
        var len = 0
        len = len or (bytes[0].toInt() and 0xff)
        len = len or ((bytes[1].toInt() and 0xff) shl 8)
        len = len or ((bytes[2].toInt() and 0xff) shl 16)
        len = len or ((bytes[3].toInt() and 0xff) shl 24)
        return len
    }

    /**
     * 转换ncm文件为mp3
     */
    fun transform() {
//        跳过魔术头信息 10 bytes
        nis.skip(10)
//        获取key
        val key = cr4Key()
//        跳过获取元信息和专辑图片(因为我只想要歌曲内容,能听就行)
        skipMataDataAndImage()
//        保存歌曲内容到mp3文件
        saveMusic(key)
    }

    /**
     * 保存内容到输出文件
     */
    private fun saveMusic(key: ByteArray) {
        KSA(key)
        val buffer = ByteArray(0x8000)
        var len: Int
        while (nis.read(buffer).also { len = it } > 0) {
            PRGA(buffer, len)
            nos.write(buffer, 0, len)
        }
        nis.close()
        nos.close()
    }

    /**
     * 跳过解析元信息和专辑图片数据
     */
    private fun skipMataDataAndImage() {
        val bytes = ByteArray(4)
        //获取元信息长度
        nis.read(bytes, 0, 4)
        var len = getLength(bytes)
//        跳过获取元信息
        nis.skip(len.toLong())
        //跳过:CRC(4字节), Gap(5字节)
        nis.skip(9)
//        获取图片信息长度
        nis.read(bytes, 0, 4)
        len = getLength(bytes)
//        跳过获取图片信息
        nis.skip(len.toLong())
    }


    /**
     * 获取CR4密钥
     * 把用AES128加密的CR4密钥进行解密
     */
    private fun cr4Key(): ByteArray {
//        KEY Length	4 bytes	用AES128加密RC4密钥后的长度(小端字节排序,无符号整型)
        var bytes = ByteArray(4)
        nis.read(bytes, 0, 4)
        val len = getLength(bytes)
        bytes = ByteArray(len)
        nis.read(bytes, 0, len)
//        KEY From AES128 Decode	KEY Length(其实就是128 bytes) 用AES128加密的RC4密钥
//        解密过程
        //1.按字节对0x64异或
        for (i in 0..<len) {
            bytes[i] = bytes[i] xor 0x64.toByte()
        }
        //2.AES解密(其中PKCS5Padding填充模式会去除末尾填充部分)
        bytes = decrypt(bytes)!!
        //3.去除前面`neteasecloudmusic`的17个字节
        val key = ByteArray(bytes.size - 17)
        System.arraycopy(bytes, 17, key, 0, key.size)
        return key
    }

    /**
     * 功能:AES/ECB/PKCS5Padding解密
     *
     * @param data            密文
     * @return 原文
     */
    private fun decrypt(data: ByteArray): ByteArray? {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        val secretKeySpec = SecretKeySpec(CORE_KEY, ALGORITHM)
        cipher.init(Cipher.DECRYPT_MODE, secretKeySpec)
        return cipher.doFinal(data)
    }

}
```

