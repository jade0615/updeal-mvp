#!/bin/bash

echo "🧪 UpDeal 快速测试脚本"
echo "========================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 创建测试商家
echo "${BLUE}📝 步骤 1: 创建测试商家数据...${NC}"
cd "$(dirname "$0")/.." || exit
tsx scripts/create-test-merchants.ts

echo ""
echo "${GREEN}✅ 测试商家创建完成！${NC}"
echo ""

# 2. 提供测试链接
echo "${BLUE}🔗 测试链接：${NC}"
echo ""
echo "  ${YELLOW}Discount (红色)${NC}     → http://localhost:3000/test-discount"
echo "  ${YELLOW}Coupon (紫色)${NC}       → http://localhost:3000/test-coupon"
echo "  ${YELLOW}BOGO (绿色)${NC}         → http://localhost:3000/test-bogo"
echo "  ${YELLOW}Reservation (蓝色)${NC}  → http://localhost:3000/test-reservation"
echo "  ${YELLOW}Free Item (橙色)${NC}    → http://localhost:3000/test-freeitem"
echo "  ${YELLOW}Bundle (靛蓝)${NC}       → http://localhost:3000/test-bundle"
echo ""

# 3. 检查清单
echo "${BLUE}📋 测试检查清单：${NC}"
echo ""
echo "  □ 每个页面颜色主题正确"
echo "  □ 图标显示正确 (🏷️ 🎟️ 🎁 📅 🎉 📦)"
echo "  □ 浏览器控制台无 session 错误"
echo "  □ 优惠券领取功能正常"
echo ""

# 4. 故障排除提示
echo "${YELLOW}💡 提示：${NC}"
echo "  - 如果看到 session 错误，请硬刷新页面（Cmd+Shift+R）"
echo "  - 或使用隐私模式测试（Cmd+Shift+N）"
echo "  - 详细故障排除：参考 ../TROUBLESHOOTING_SESSION_ERROR.md"
echo ""

echo "${GREEN}🎉 准备就绪！现在可以开始测试了${NC}"
