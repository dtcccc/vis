var v2;
d3.csv("data/data.csv", function (error, csvdata) {
    v2 = new view2(csvdata);
});
function view2(data) { //封装的question2类，初始化时传递的参数为总的数据集dataset
    this.dataset = data; //总的数据集
    this.ipdata = {}; //用于画sip-dip的处理后数据
    this.portdata = {}; //用于画sport-dport的处理后数据
    this.nows = []; //记录sip-dip的进度情况
    this.nowd = []; //记录sip-dip的进度情况
    this.now = 0; //记录sip-dip的进度情况
    this.look = "num"; //选择看ip数量或file大小
    this.time1 = 1462238084; //时间筛选起始值
    this.time2 = 1462238089; //时间筛选结束值
    this.port = []; //端口筛选值，[sport,dport]
    this.callback = [];
    var w = (innerWidth - (innerHeight - 100) / 2) * 0.9, //宽
        h = innerHeight / 2 * 0.9 - 50, //长
        padding = w / 20, //边距
        i, j, value, chosen = [];
    this.svg = d3.select("#view21") //ip视图的svg
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "ip");
    this.xScale = d3.scale.linear()
        .domain([0, 255])
        .range([padding, w - padding]);
    this.yScale = d3.scale.linear()
        .domain([0, 255])
        .range([h - padding, padding]);
    this.xAxis = d3.svg.axis()
        .scale(this.xScale)
        .orient("bottom").ticks(15);
    this.xBar = this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(this.xAxis);

    this.yAxis = d3.svg.axis()
        .scale(this.yScale)
        .orient("left").ticks(15);

    this.yBar = this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(this.yAxis);
    d3.select("#back").on("click", function () {
        v2.changeip(0, 0, true);
    });
    d3.select("#top").on("click", function () {
        v2.changeip(0, 0, false, true);
    });

    this.svg1 = d3.select("#view22") //port视图的svg
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "port");
    this.xScale1 = d3.scale.linear()
        .domain([0, 65535])
        .range([padding, w - padding]);
    this.yScale1 = d3.scale.linear()
        .domain([0, 65535])
        .range([h - padding, padding]);
    this.xAxis1 = d3.svg.axis()
        .scale(this.xScale1)
        .orient("bottom").ticks(15);
    this.xBar1 = this.svg1.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(this.xAxis1);

    this.yAxis1 = d3.svg.axis()
        .scale(this.yScale1)
        .orient("left").ticks(15);

    this.yBar1 = this.svg1.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(this.yAxis1);
    for (i in this.dataset) chosen[i] = true;
    parse_data(this, chosen);
    redraw(this);

    this.setcallback = function (callback) {
        this.callback = callback; //回调函数数组，当对这两个视图进行交互操作的时候触发的函数，传入参数为chosen(一个一维数组，标记了每个dataset是否显示)
    }
    this.changeip = function (s, d, isback = false, istop = false) { //交互ip操作的筛选，点击时触发
        if (this.now == 3 && !isback && !istop) return;
        this.nows[this.now] = s;
        this.nowd[this.now] = d;
        if (isback && this.now)--this.now;
        else if (istop) this.now = 0;
        else ++this.now;
        var result = this.select(this.time1, this.time2);
        //this.draw(result);
        this.callback.map(function (i) { i(result) });

    }
    this.changeport = function (sp, dp) { //交互port操作的筛选，点击时触发
        if (this.port[0] == sp && this.port[1] == dp) this.port = [];
        else this.port = [sp, dp];
        var result = this.select(this.time1, this.time2);
        //this.draw(result);
        this.callback.map(function (i) { i(result) });

    }
    function redraw(that) { //私有方法，重画
        var i, j, value,
            tempdata = [],
            ipmax = 0,
            ipmin = 2573197,
            ipall = 0,
            portmax = 0,
            portmin = 10000,
            portall = 0;
        d3.selectAll("circle").remove();

        for (i in that.ipdata)
            for (j in that.ipdata[i]) {
                value = that.ipdata[i][j][that.look];
                ipall += value;
                tempdata.push({ sip: i, dip: j, num: value });
                if (value > ipmax) ipmax = value;
                if (value < ipmin) ipmin = value;
            }
        that.svg.selectAll("circle")
            .data(tempdata)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return that.xScale(d.sip);
            })
            .attr("cy", function (d) {
                return that.yScale(d.dip);
            })
            .attr("r", 5)
            .attr("fill", "blue")
            .attr("opacity", function (d) {
                return (d.num - ipmin) / (ipmax - ipmin) / 4 * 3 + 1 / 4;
            })
            .on("mouseover", function (d) {
                var temp = [];
                for (i = 0; i < that.now; ++i)temp.push(that.nows[i]);
                temp.push(d.sip);
                d3.select("#sip").text(temp.join("."));
                temp = [];
                for (i = 0; i < that.now; ++i)temp.push(that.nowd[i]);
                temp.push(d.dip);
                d3.select("#dip").text(temp.join("."));
                d3.select("#num").text(d.num);
                d3.select(this).attr("r", 10);
            })
            .on("mouseout", function (d) {
                d3.select(this).attr("r", 2);
                var temp = [];
                for (i = 0; i < that.now; ++i)temp.push(that.nows[i]);
                if (!that.now) temp = [0];
                d3.select("#sip").text(temp.join("."));
                temp = [];
                for (i = 0; i < that.now; ++i)temp.push(that.nowd[i]);
                if (!that.now) temp = [0];
                d3.select("#dip").text(temp.join("."));
                d3.select("#num").text(ipall);
            })
            .on("click", function (d) {
                v2.changeip(d.sip, d.dip);
            });
        tempdata = [];
        for (i in that.portdata)
            for (j in that.portdata[i]) {
                value = that.portdata[i][j][that.look];
                portall += value;
                tempdata.push({ sport: i, dport: j, num: value });
                if (value > portmax) portmax = value;
                if (value < portmin) portmin = value;
            }
        that.svg1.selectAll("circle")
            .data(tempdata)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return that.xScale1(d.sport);
            })
            .attr("cy", function (d) {
                return that.yScale1(d.dport);
            })
            .attr("r", 5)
            .attr("fill", "blue")
            .attr("opacity", function (d) {
                return (d.num - portmin) / (portmax - portmin) / 4 * 3 + 1 / 4;
            })
            .on("mouseover", function (d) {
                d3.select(this).attr("r", 10);
                d3.select("#sport").text(d.sport);
                d3.select("#dport").text(d.dport);
                d3.select("#pnum").text(d.num);
            })
            .on("mouseout", function (d) {
                d3.select(this).attr("r", 2);
                d3.select("#sport").text(port.length ? port[0] : "sport");
                d3.select("#dport").text(port.length ? port[1] : "dport");
                d3.select("#pnum").text(portall);
            })
            .on("click", function (d) {
                v2.changeport(d.sport, d.dport);
            });
    }
    function parse_data(that, chosen) { //私有方法，统计处理数据
        var i, sip, dip, sport, dport,l;
        that.ipdata = {};
        that.portdata = {};
		l=that.dataset.length;
        for (i=0;i<l;++i) {
            if (!chosen[i]) continue;
            sip = that.dataset[i].SRCIP.split(".")[that.now];
            dip = that.dataset[i].DSTIP.split(".")[that.now];
            if (!that.ipdata[sip]) that.ipdata[sip] = {};
            if (!that.ipdata[sip][dip]) that.ipdata[sip][dip] = { num: 0 };
            ++that.ipdata[sip][dip]["num"];

            sport = that.dataset[i].SRCPORT;
            dport = that.dataset[i].DSTPORT;
            if (!that.portdata[sport]) that.portdata[sport] = {};
            if (!that.portdata[sport][dport]) that.portdata[sport][dport] = { num: 0 };
            ++that.portdata[sport][dport]["num"];

        }
    }
    function parse_data2(that, data) { //私有方法，统计处理数据
        var i, sip, dip, sport, dport;
        that.ipdata = {};
        that.portdata = {};
        for (i in data) {
            sip = data[i].SRCIP.split(".")[that.now];
            dip = data[i].DSTIP.split(".")[that.now];
            if (!that.ipdata[sip]) that.ipdata[sip] = {};
            if (!that.ipdata[sip][dip]) that.ipdata[sip][dip] = { num: 0 };
            ++that.ipdata[sip][dip]["num"];

            sport = data[i].SRCPORT;
            dport = data[i].DSTPORT;
            if (!that.portdata[sport]) that.portdata[sport] = {};
            if (!that.portdata[sport][dport]) that.portdata[sport][dport] = { num: 0 };
            ++that.portdata[sport][dport]["num"];

        }
    }
    this.draw = function (chosen) { //接受chosen，解析重画
        parse_data(this, chosen);
        redraw(this);
    }
    this.draw2 = function (data) { //接受dataset，解析重画
        parse_data2(this, data);
        redraw(this);
    }
    this.select = function (t1, t2, chosen) { //根据外部条件筛选数据，传入参数为起始时间，结束时间
        this.time1 = t1;
        this.time2 = t2;
        var i, j, t, vt, temp = [];//result=[]
        for (i in this.dataset) {
            if (!chosen[i]) continue;
            t = new Date(this.dataset[i].STARTTIME).getTime() / 1000;
            if (t <= this.time1 || t > this.time2) { chosen[i] = false; continue; }
            if (this.port.length && !(this.dataset[i].SRCPORT == this.port[0] && this.dataset[i].DSTPORT == this.port[1])) { chosen[i] = false; continue; }
            temp = [];
            for (j = 0; j < this.now; ++j)temp.push(this.nows[j]);
            temp = temp.join(".");
            if (this.dataset[i].SRCIP.indexOf(temp)) { chosen[i] = false; continue; }
            temp = [];
            for (j = 0; j < this.now; ++j)temp.push(this.nowd[j]);
            temp = temp.join(".");
            if (this.dataset[i].DSTIP.indexOf(temp)) { chosen[i] = false; continue; }
            chosen[i] = true;
            //result.push(this.dataset[i]);
        }
        parse_data(this, chosen);
        redraw(this);
        //return result;
        return chosen;
    }
    this.changelook = function (l) { //备用功能，可以无视//切换查看数据，num是连接数量，file是文件大小
        this.look = l;
        redraw(this);
    }
}