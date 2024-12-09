# 使用官方Node.js的Docker镜像作为基础镜像
FROM node:16-slim

# 设置工作目录为/app
WORKDIR /app

# 将package.json和package-lock.json（如果使用npm）复制到工作目录
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 将项目中的所有文件复制到工作目录中
COPY . .

# 暴露容器的3000端口
EXPOSE 3000

# 定义环境变量
ENV NODE_ENV production

# 设置时区为上海
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone

# 容器启动时执行的命令
CMD ["node", "index.js"]