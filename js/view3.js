var v3 = new view3();
function view3() {
    this.width = innerWidth - 100; //宽
    this.height = innerHeight - 100; //长
    this.radius = innerHeight / 4 - 100; //圆半径
    this.color = d3.scale.category20();
    this.color1 = ["blue", "red", "yellow", "green", "grey", "purple", "chocolate"];
    this.time = new Date();//时间
    this.pt = 0; //data的指针
    this.data = {}; //按ip分类整理的data数据
    this.dataset; //data原始数据
    this.st = {};
    this.ed = {}; //每个ip的9格查找范围记录，辅助用
    this.showtable = {}; //标记显示区块
    this.cirdata = []; //圈数据
    this.chosen = []; //标记每个数据是否有效（被筛选中）
    this.proto_chosen = []; //标记每个协议的筛选情况
    this.proid = [4, 18, 33, 34, 36, 57, 58]; //常量，协议记录
    this.start = 0;
    this.end = 0;
    this.overback = this.outback = this.clickback = this.callback = [];

    this.setcallback = function (overback, outback, clickback, callback) { //设置当鼠标在该视图移入、移出、点击、筛选的回调函数(由函数构成的数组)，传入参数为通信id
        this.overback = overback;
        this.outback = outback;
        this.clickback = clickback;
        this.callback = callback;
    }

    d3.json("data/server.json", function (error, root) {
        draw_server(v3, root);

        d3.json("data/circle.json", function (error, root) {
            draw_circle(v3, root);
            draw_big_circle(v3);
            d3.csv("data/data3.csv", function (error, root) {
                v3.dataset = root;
                main(v3);
            });
        });
    });
    function draw_server(that, root) { //画出服务器的树状图表示
        var tree = d3.layout.tree()
            .size([that.width / 2, that.height / 4]);
        var diagonal = d3.svg.diagonal.radial()
            .projection(function (d) { return [d.y, d.x / 180 * Math.PI]; });
        var svg = d3.select("#view3").append("svg")
            .attr("width", that.width)
            .attr("height", that.height)
            .attr("class", "main")
            .append("g")
            .attr("transform", "translate(" + that.width / 2 + "," + that.height / 2 + ")");
        var nodes = tree.nodes(root);
        var links = tree.links(nodes);

        var link = svg.selectAll(".link")
            .data(links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", diagonal);

        var node = svg.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", function (d) { return "i" + d.name })
            .attr("transform", function (d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
            .attr("title", function (d) { return d.name; })
            .on("mouseover", function () { v3.over(this); })
            .on("mouseout", function () { v3.out(this); })
            .on("click", function () { v3.onclick(this); });


        node.append("circle")
            .attr("r", 2);
    }
    function draw_circle(that, root) { //画出外圈
        var svg = d3.select(".main")
            .append("g")
            .attr("class", "circle")
            .attr("transform", "translate(" + that.width / 2 + "," + that.height / 2 + ")");
        var partition = d3.layout.partition()
            .sort(null)
            .size([2 * Math.PI, that.radius * that.radius])
            .value(function (d) { return 1; });

        var arc = d3.svg.arc()
            .startAngle(function (d) { return d.x; })
            .endAngle(function (d) { return d.x + d.dx; })
            .innerRadius(function (d) { return Math.sqrt(d.y) + that.height / 4; })
            .outerRadius(function (d) { return Math.sqrt(d.y + d.dy) + that.height / 4; });

        var nodes = partition.nodes(root);
        var links = partition.links(nodes);
        var arcs = svg.selectAll("g")
            .data(nodes)
            .enter().append("g");

        arcs.append("path")
            .attr("display", function (d) { return d.depth ? null : "none"; }) // hide inner ring
            .attr("d", arc)
            .style("stroke", "#000")
            .style("fill", "#fff")
            .attr("class", function (d, i) {
                var str = (i <= 54 * 9 ? "IPv6-ICMP" : i <= 84 * 9 ? "XTP" : i <= 92 * 9 ? "3PC" : i <= 94 * 9 ? "IP" : i <= 96 * 9 ? "MUX" : i <= 98 * 9 ? "SEP" : "SKIP");
                str += " c";
                var tt = d;
                while (tt.name == undefined) tt = tt.parent;
                str += tt.name;
                str += " d" + d.depth;
                return str;
            })
            .on("mouseover", function () { v3.over(this); })
            .on("mouseout", function () { v3.out(this); })
            .on("click", function () { v3.onclick(this); });
    }
    function draw_big_circle(that) { //画出最外圈，用于标识
        var pie = d3.layout.pie(),
            piedata = pie([2, 2, 2, 8, 30, 2, 54]),
            text = ["IP", "MUX", "SEP", "3PC", "XTP", "SKIP", "IPv6-ICMP"],
            arc = d3.svg.arc()  //弧生成器
                .innerRadius(that.height * 0.45)   //设置内半径
                .outerRadius(that.height * 0.5),  //设置外半径
            svg = d3.select(".main").append("g");
        var arcs = svg.selectAll("g")
            .data(piedata)
            .enter()
            .append("g")
            .attr("transform", "translate(" + (that.width / 2) + "," + (that.height / 2) + ")");
        arcs.append("path")
            .attr("fill", function (d, i) {
                return that.color1[i];
            })
            .attr("d", function (d) {
                return arc(d);   //调用弧生成器，得到路径值
            })
            .attr("class", function (d, i) { return "w" + i; })
            .attr("data", function (d, i) {
                return that.proid[i];
            })
            .on("click", function () { v3.clickpro(this); });
        arcs.append("text")
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .text(function (d, i) {
                return text[i];
            });
    }
    function main(that) { //主程序，处理数据，画图
        var l = that.dataset.length, i, t;
        //that.time=new Date(that.dataset[0]["time"]*1000);
        //that.time.setTime(that.time.getTime()-1000);
        for (i = 0; i < l; ++i) {
            t = that.dataset[i];
            that.chosen[i] = 1;
            if (!that.data[t.sip]) {
                that.data[t.sip] = [t];
                that.st[t.sip] = 0;
                that.ed[t.sip] = 1;
            }
            else that.data[t.sip].push(t);
        }
        for (i in that.proid) that.proto_chosen[that.proid[i]] = 1;
        //console.log(that.data);
        //d3.select("#time").text(that.time);
    }
    this.fresh = function (start = 0, end = 0, chosen = []) { //接收参数，刷新图像
        var temp, i, j, t, jg, l;
        this.showtable = {}; //初始化显示列表
        this.cirdata = [];
        d3.select(".line").remove(); //清除前一次
        temp = d3.selectAll(".light")[0];
        l = temp.length;
        for (i = 0; i < l; ++i)
            temp[i].classList.forEach(function (a1, a2, a3) {
                if (a1[0] == "i" && a1[1] == "d" || a1[0] == "t")
                    a3.remove(a1);
            });
        d3.selectAll(".light").on("mouseover", null)
            .on("mouseout", null)
            .classed("light", false)
            .classed("over", false)
            .classed("select", false)
            .style("fill", "#fff");
        if (start) this.start = start;
        if (end) this.end = end;
        if (chosen.length) this.chosen = chosen;
        this.time.setTime(this.end * 1000);
        jg = (this.end - this.start) / 9 * 1000;
        for (this.pt = 0; this.pt < 200; ++this.pt) {
            if (!this.chosen[this.pt]) continue;
            temp = new Date(this.dataset[this.pt]["time"] * 1000);
            if (temp <= this.time && temp > this.time - jg) {
                if (!this.showtable[this.dataset[this.pt]["sip"]])
                    this.showtable[this.dataset[this.pt]["sip"]] = [this.dataset[this.pt]["protocol"]];
                else if (this.showtable[this.dataset[this.pt]["sip"]].indexOf(this.dataset[this.pt]["protocol"]) == -1)
                    this.showtable[this.dataset[this.pt]["sip"]].push(this.dataset[this.pt]["protocol"]);
            }
        }
        t = new Date();
        t.setTime(this.start * 1000); //回溯到starttime
        for (i in this.showtable) {
            for (this.st[i] = 0; this.st[i] < this.data[i].length; ++this.st[i]) {
                temp = new Date(this.data[i][this.st[i]]["time"] * 1000);
                if (temp > t) break;
            }
            this.ed[i] = this.st[i];
            for (; this.ed[i] < this.data[i].length; ++this.ed[i]) {
                temp = new Date(this.data[i][this.ed[i]]["time"] * 1000);
                if (temp > this.time) break;
            }
            /*for(j=st[i];j<ed[i];++j){
                temp=new Date(data[i][j]["time"]);
                showtable[i][Math.floor((time-temp)/1000/60/5)]=1; //历史回溯的哪一格点亮
            }*/
        }
        //console.log(this.showtable);
        //d3.select("#time").text(this.time);

        //数据准备完毕，开始作图
        var svg = d3.select(".main")
            .append("g")
            .attr("class", "line");
        for (i in this.showtable) {
            for (k in this.showtable[i]) {
                var arr = [], ast, al, source, target, l1, l2, c;
                switch (this.showtable[i][k]) {
                    case "58":
                        ast = 1;
                        al = 54;
                        c = 6;
                        break;
                    case "36":
                        ast = 55;
                        al = 30;
                        c = 4;
                        break;
                    case "34":
                        ast = 85;
                        al = 8;
                        c = 3;
                        break;
                    case "4":
                        ast = 93;
                        al = 2;
                        c = 0;
                        break;
                    case "18":
                        ast = 95;
                        al = 2;
                        c = 1;
                        break;
                    case "33":
                        ast = 97;
                        al = 2;
                        c = 2;
                        break;
                    default:
                        ast = 99;
                        al = 2;
                        c = 5;
                }
                for (j = 0; j < al; ++j)arr[j] = j + ast;
                arr.sort(function () { return 0.5 - Math.random() });
                for (j = 0; j < al; ++j)
                    if (!d3.select(".c" + arr[j] + ".d1").classed("light")) break;
                j = arr[j];
                if (!j) continue;
                this.cirdata[j] = [];
                for (var ii = 0; ii < 9; ++ii)this.cirdata[j][ii] = [];
                target = d3.select(".c" + j + ".d1");
                source = document.getElementsByClassName("i" + i)[0];
                l1 = server_position(source.getAttribute("transform"));

                l2 = circle_position(target.attr("d"));
                svg.append("path")
                    .attr("d", "M" + l1.join() + "L" + l2.join() + "Z")
                    .attr("transform", "translate(" + (this.width / 2) + "," + (this.height / 2) + ")")
                    .style("stroke-width", 2)
                    .style("stroke", this.color1[c])
                    .classed("t" + j, true)
                    .classed("light", true)
                    .on("mouseover", function () { v3.over(this); })
                    .on("mouseout", function () { v3.out(this); })
                    .on("click", function () { v3.onclick(this); });
                d3.select(source).classed("light", true)
                    .classed("t" + j, true);
                target.classed("light", true)
                    .style("fill", this.color1[c]);
                /*for(t=1;t<9;++t)
                    if(showtable[i][t]){
                        temp=d3.select(".c"+j+".d"+(t+1));
                        temp.classed("light",true)
                            .style("fill",color1[c]);
                    }*/
                for (t = this.st[i]; t < this.ed[i]; ++t) {
                    if (this.data[i][t]["protocol"] != this.showtable[i][k]) continue;
                    temp = new Date(this.data[i][t]["time"] * 1000);
                    num = Math.floor((this.time - temp) / jg);
                    //console.log(num,i,t);
                    this.cirdata[j][num].push(this.data[i][t]);
                    d3.select(".c" + j + ".d" + (num + 1))
                        .classed("light", true)
                        .style("fill", this.color1[c])
                        .classed("id" + this.data[i][t]["id"], true);
                }

            }




        }

        /*d3.selectAll("path.light")
            .on("mouseover",show_data)
            .on("mouseout",function(){d3.select("#text").text("")});*/


    }
    function circle_position(d) { //通过path的d属性计算circle中心位置
        var t, t1, xy1, xy2, r;
        t = d.indexOf("A");
        xy1 = d.substring(1, t).split(",");
        t = d.indexOf("L") + 1;
        t1 = d.lastIndexOf("A");
        xy2 = d.substring(t, t1).split(",");
        r = [(parseFloat(xy1[0]) + parseFloat(xy2[0])) / 2, (parseFloat(xy1[1]) + parseFloat(xy2[1])) / 2];
        return r;
    }
    function server_position(d) { //通过transform属性计算server位置
        var t, r, l;
        t = d.indexOf(")");
        r = parseFloat(d.substring(7, t));
        t = d.lastIndexOf("(") + 1;
        l = parseFloat(d.substring(t));
        return [l * Math.cos(r * Math.PI / 180), l * Math.sin(r * Math.PI / 180)];
    }
    /*function show_data(that){ //显示数据
        var temp=that.classList,
        i=parseInt(temp[1].substr(1)),
        j=parseInt(temp[2].substr(1))-1,
        arr=[],
        str="";
        for(var k in that.cirdata[i][j]){
            arr=[];
            for(var k1 in that.cirdata[i][j][k]){
            arr.push(that.cirdata[i][j][k][k1]);
            }
            str+=arr.join(" ");
            str+="<br>";
        }
        d3.select("#text").html(str);
    }
        */

    this.clickpro = function (that) { //点击最外圈执行筛选响应
        var proid = that.getAttribute("data"), this1 = this, i, l = this.dataset.length;
        if (this.proto_chosen[proid]) {
            this.proto_chosen[proid] = 0;
            d3.select(that).attr("fill", "white");
        }
        else {
            this.proto_chosen[proid] = 1;
            d3.select(that).attr("fill", function () {
                return this1.color1[this.classList[0].substr(1)];
            });
        }
        for (i = 0; i < l; ++i) {
            if (this.proto_chosen[this.dataset[i].protocol]) this.chosen[i] = 1;
            else this.chosen[i] = 0;
        }
        this.fresh();
        this.callback.map(function (i) { i(v3.chosen); });
    }

    this.over = function (that) { //鼠标移上去后的事件响应
        if (!d3.select(that).classed("light")) return;
        var temp = that.classList, t1, i, id, result;
        if (temp[0][0] == "t") { //连线
            d3.selectAll("." + temp[0]).classed("over", true);
            t1 = ".c" + temp[0].substr(1) + ".light";
            d3.selectAll(t1).classed("over", true);
            result = this.cirdata[temp[0].substr(1)][0][0]["id"];
        }
        else if (temp[0][0] == "i") { //ip点
            for (i in temp)
                if (temp[i][0] == "t") {
                    d3.selectAll("." + temp[i]).classed("over", true);
                    t1 = ".c" + temp[i].substr(1) + ".light";
                    d3.selectAll(t1).classed("over", true);
                }
            result = temp[0].substr(1);
        }
        else { //方块
            temp = temp[1];
            d3.selectAll("." + temp + ".light").classed("over", true);
            t1 = ".t" + temp.substr(1);
            d3.selectAll(t1).classed("over", true);
            result = this.cirdata[temp.substr(1)][0][0]["id"];
        }
        d3.selectAll(".light").style("opacity", 0.2);
        d3.selectAll(".light.over").style("opacity", 1);
        d3.selectAll(".light.select").style("opacity", 1);
        this.overback.map(function (i) { i(result) });
    }

    this.out = function (that) { //鼠标移出后的事件响应
        if (!d3.select(that).classed("light")) return;
        var temp = that.classList, t1, i;
        if (temp[0][0] == "t") { //连线
            d3.selectAll("." + temp[0]).classed("over", false);
            t1 = ".c" + temp[0].substr(1) + ".light";
            d3.selectAll(t1).classed("over", false);
            result = this.cirdata[temp[0].substr(1)][0][0]["id"];
        }
        else if (temp[0][0] == "i") { //ip点
            for (i in temp)
                if (temp[i][0] == "t") {
                    d3.selectAll("." + temp[i]).classed("over", false);
                    t1 = ".c" + temp[i].substr(1) + ".light";
                    d3.selectAll(t1).classed("over", false);
                }
            result = temp[0].substr(1);
        }
        else { //方块
            temp = temp[1];
            d3.selectAll("." + temp + ".light").classed("over", false);
            t1 = ".t" + temp.substr(1);
            d3.selectAll(t1).classed("over", false);
            result = this.cirdata[temp.substr(1)][0][0]["id"];
        }
        if (d3.selectAll(".over")[0].length + d3.selectAll(".select")[0].length) { //还有别的被突出
            d3.selectAll(".light").style("opacity", 0.2);
            d3.selectAll(".light.over").style("opacity", 1);
            d3.selectAll(".light.select").style("opacity", 1);
        }
        else d3.selectAll(".light").style("opacity", 1);
        this.overback.map(function (i) { i(result) });
    }

    this.onclick = function (that) { //鼠标点击时的事件响应
        if (!d3.select(that).classed("light")) return;
        var temp = that.classList, t1, i;
        var bool = !d3.select(that).classed("select");
        if (temp[0][0] == "t") { //连线
            d3.selectAll("." + temp[0]).classed("select", bool);
            t1 = ".c" + temp[0].substr(1) + ".light";
            d3.selectAll(t1).classed("select", bool);
            result = this.cirdata[temp[0].substr(1)][0][0]["id"];
        }
        else if (temp[0][0] == "i") { //ip点
            for (i in temp)
                if (temp[i][0] == "t") {
                    d3.selectAll("." + temp[i]).classed("select", bool);
                    t1 = ".c" + temp[i].substr(1) + ".light";
                    d3.selectAll(t1).classed("select", bool);
                }
            result = temp[0].substr(1);
        }
        else { //方块
            temp = temp[1];
            d3.selectAll("." + temp + ".light").classed("select", bool);
            t1 = ".t" + temp.substr(1);
            d3.selectAll(t1).classed("select", bool);
            result = this.cirdata[temp.substr(1)][0][0]["id"];
        }
        if (d3.selectAll(".over")[0].length + d3.selectAll(".select")[0].length) { //还有别的被突出
            d3.selectAll(".light").style("opacity", 0.2);
            d3.selectAll(".light.over").style("opacity", 1);
            d3.selectAll(".light.select").style("opacity", 1);
        }
        else d3.selectAll(".light").style("opacity", 1);
        this.overback.map(function (i) { i(result) });
    }

    this._over = function (data) { //联动函数
        var t;
        if (isNaN(data)) { //传入参数为ip
            t = d3.select(".i" + data)[0][0];
            if (t) this.over(t);
        }
        else { //传入参数为id
            t = d3.select(".id" + data)[0][0];
            if (t) this.over(t);
        }
    }

    this._out = function (data) { //联动函数
        var t;
        if (isNaN(data)) { //传入参数为ip
            t = d3.select(".i" + data)[0][0];
            if (t) this.out(t);
        }
        else { //传入参数为id
            t = d3.select(".id" + data)[0][0];
            if (t) this.out(t);
        }
    }

    this._click = function (data) { //联动函数
        var t;
        if (isNaN(data)) { //传入参数为ip
            t = d3.select(".i" + data)[0][0];
            if (t) this.click(t);
        }
        else { //传入参数为id
            t = d3.select(".id" + data)[0][0];
            if (t) this.click(t);
        }
    }

}
