var http = require("http");
var querystring =  require("querystring");
var urlobj = require("url");
var request = function(method,url,data,func){
    let promise = new Promise(function(resolve,reject){
        let parseURL = urlobj.parse(url);
        let host = parseURL.hostname;
        let port = parseURL.port || 80;
        let path = parseURL.path;
        let queryData = "";
        let bodyData = "";
        // if(typeof data == "function"){
        //    func = data;
        // }else{
            if(method.toLowerCase() == "get"){
                queryData = querystring.stringify(data);
            }else{
                bodyData = querystring.stringify(data);
            }
        // }
        var opt = {
            method:method,
            host:host,
            port:port,
            path:path + "?" + queryData,
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded',
                "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
            }
        };
        var req = http.request(opt, function (serverFeedback) {

            
            if (serverFeedback.statusCode == 200) {

                var body = "";
                serverFeedback.on('data', function (data) {
                    // console.log("data",data.toString());
                    if(typeof data == 'object'){
                        body += data.toString("utf-8");
                    }else{
                        body += data;
                    }
                    
                    
                })
                .on('end', function () {
                        try{
                            resolve(JSON.parse(body));
                        }catch(e){
                            resolve(body);
                        }


                    });
            } else {
                // func();
                resolve();
            }
        });
        req.write(bodyData);
        req.end();
    });
    return promise;

}
var opt = {};
var asyncFunc = (function* (){
    for(;;){
        yield request(opt.method,opt.url,opt.data);
    }
}())
var common = function(url,data){
    if(host){
        url = host + url;
    }
    if(url.search("://") == -1){
        url = "http://"+url;
    }
    opt.url = url;
    opt.data = data;
    return asyncFunc.next().value;
}
var get = function(url,data){
    opt.method = "get";
    return common(url,data);
}
var post = function(url,data){
    opt.method = "post";
    return common(url,data);
}
var del = function(url,data){
    opt.method = "delete";
    return common(url,data);
}
var put = function(url,data){
    opt.method = "put";
    return common(url,data);
}

var host;
module.exports = {
    get,post,put,delete:del,url:function(param){
        host = param;
    }
}
