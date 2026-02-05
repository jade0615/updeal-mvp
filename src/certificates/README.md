# Apple Wallet Certificates Setup

## 📋 需要的文件

请将以下证书文件放在此目录中：

### 1. Certificates.p12
- **来源：** Apple Developer → Certificates, Identifiers & Profiles → Certificates
- **类型：** Pass Type ID Certificate
- **格式：** .p12 文件
- **密码：** 请将密码添加到 `.env.local` 的 `APPLE_SIGNER_KEY_PASSWORD` 变量

### 2. wwdr.pem
- **来源：** https://www.apple.com/certificateauthority/
- **类型：** Worldwide Developer Relations - G4 (Intermediate Certificate)
- **格式：** .pem 文件

## 🔐 获取证书的步骤

### Step 1: 创建 Pass Type ID Certificate

1. 登录 [Apple Developer](https://developer.apple.com/)
2. 进入 **Certificates, Identifiers & Profiles**
3. 点击 **Identifiers** → **Pass Type IDs**
4. 创建或选择 `pass.com.hiraccoon.coupon`
5. 点击 **Create Certificate**
6. 上传 CSR 文件（如果没有，可以使用 `scripts/generate-csr.ts` 生成）
7. 下载证书（.cer 文件）
8. 双击导入到 Keychain Access
9. 在 Keychain Access 中，右键点击证书 → **Export**
10. 选择 **Personal Information Exchange (.p12)**
11. 设置密码并导出为 `Certificates.p12`

### Step 2: 下载 WWDR Certificate

1. 访问 https://www.apple.com/certificateauthority/
2. 下载 **Worldwide Developer Relations - G4** 证书
3. 双击安装
4. 使用以下命令导出为 .pem 格式：
   ```bash
   security find-certificate -c "Worldwide Developer Relations" -p > wwdr.pem
   ```

## 📂 最终文件结构

```
src/certificates/
├── README.md (本文件)
├── Certificates.p12 (你的 Pass Type ID 证书)
└── wwdr.pem (Apple WWDR 证书)
```

## 🔒 安全提示

- ⚠️ **切勿将证书文件提交到 Git！**
- `.gitignore` 已配置忽略所有 `.p12` 和 `.pem` 文件
- 生产环境建议使用环境变量存储 Base64 编码的证书

## 🚀 环境变量配置

在 `.env.local` 中：

```env
APPLE_TEAM_ID=ULZM5FW53S
APPLE_PASS_TYPE_ID=pass.com.hiraccoon.coupon
APPLE_SIGNER_KEY_PASSWORD=your-p12-password-here
```

## 🧪 测试

证书配置完成后，运行：

```bash
npm run dev
```

访问 `http://localhost:3000/api/test-pass` 测试 Pass 生成。
