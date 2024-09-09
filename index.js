// SPDX-License-Identifier: 0BSD

// 定义DNS over HTTPS (DoH)的端点
const doh = 'https://dns.alidns.com/dns-query'
const dohjson = 'https://dns.alidns.com/dns-query'

// 定义内容类型
const contype = 'application/dns-message'
const jstontype = 'application/dns-json'

// 设置路径前缀,默认允许所有路径
const path = ''; // 如果需要指定路径,必须以'/'开头,例如 "/dns-query"

// 创建一个404响应对象
const r404 = new Response(null, {status: 404});

// 导出默认的fetch处理函数
export default {
    async fetch(request, env, ctx) {
        return handleRequest(request);
    },
};

async function handleRequest(request) {
    // 使用Promise<Response>可以减少计费时间
    let res = r404;
    const { method, headers } = request
    const {searchParams, pathname} = new URL(request.url)
    
    // 检查请求路径是否符合设定的前缀
    if (!pathname.startsWith(path)) {
        return r404;
    }

    // 处理GET请求,用于DNS查询
    if (method === 'GET' && searchParams.has('dns')) {
        res = fetch(`${doh}?dns=${searchParams.get('dns')}`, {
            headers: { 'Accept': contype }
        });
    } 
    // 处理POST请求,用于DNS查询
    else if (method === 'POST' && headers.get('content-type') === contype) {
        // 直接传输请求体,无需等待
        res = fetch(doh, {
            method: 'POST',
            headers: {
                'Accept': contype,
                'Content-Type': contype,
            },
            body: request.body,
        });
    } 
    // 处理其他请求,使用JSON格式
    else {
        res = fetch(`${dohjson}${new URL(request.url).search}`, {
            headers: { 'Accept': jstontype }
        });
    }

    return res;
}
