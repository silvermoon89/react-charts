import React, { PureComponent } from 'react';
import {
  Chart,
  Geom,
  Axis,
  Tooltip,
  Coord,
  Label,
  Legend,
  View,
  Guide,
  Shape,
} from "bizcharts";

import {
  Row,
  Col,
} from 'antd';

import moment from 'moment';
import styles from './charts.less';
import DataSet from "@antv/data-set";


const {
  Html,
  Arc
} = Guide;


Shape.registerShape('point', 'pointer', {
  drawShape(cfg, group) {
    let point = cfg.points[0]; // 获取第一个标记点

    point = this.parsePoint(point);
    const center = this.parsePoint({
      // 获取极坐标系下画布中心点
      x: 0,
      y: 0
    });

    // 绘制指针
    group.addShape('line', {
      attrs: {
        x1: center.x,
        y1: center.y,
        x2: point.x,
        y2: point.y,
        stroke: '#fffeee',
        lineWidth: 4,
        lineCap: 'round'
      }
    });
    return group.addShape('circle', {
      attrs: {
        x: center.x,
        y: center.y,
        r: 6,
        stroke: '#fffeee',
        lineWidth: 3.5,
        fill: '#fff'
      }
    });
  }

});
const cols = {
  value: {
    min: 0,
    max: 10,
    tickInterval: 2.5,
    nice: false
  }
};

const mapUserData2 = [{
  "name": "四川",
  "adcode":510000,
}, {
  "name": "云南",
  "adcode":530000,
}, {
  "name": "山东",
  "adcode":370000,
}, {
  "name": "海南",
  "adcode":460000,
}, {
  "name": "上海",
  "adcode":310000,
}, {
  "name": "新疆",
  "adcode":650000,
}, {
  "name": "江苏",
  "adcode":320000,
}, {
  "name": "北京",
  "adcode":110000,
}]

const mapuserdata = () => {
  mapUserData2.map(item => {
    item.value = parseInt((Math.random() * 10 + 20).toFixed(0));
  });
  return mapUserData2;
}

const orderGrow = () => {
  return parseInt((Math.random() * 10 + 5).toFixed(0))
}

class Charts extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      height: document.documentElement.clientHeight * 6 / 7 - 70 || document.body.clientHeight * 5 / 6 - 70,
      screenHt: document.documentElement.clientHeight || document.body.clientHeight,
      data: [{
        value: 9.8
      }],
      lineWidth: 12,
      mapUserData: [],
      currentDate: moment(new Date()).format("YYYY/MM/DD  HH:mm:ss"),
      Todata: {
        "torder": 18624,
        "tmoney": 279960.00,
        "allorder": 8653157,
        "allmoney": 26944695.00
      }
    }
  }


  componentDidMount() {

    //每秒刷新数据，每天0点初始化数据
    this.interval = setInterval(() => {
      const { Todata } = this.state;
      const num = orderGrow();
      const time = moment(new Date()).format("HH:mm:ss");
      if (time == "00:00:01") {
        this.setState({
          mapUserData: mapuserdata(),
          currentDate: moment(new Date()).format("YYYY/MM/DD  HH:mm:ss"),
          Todata: {
            "torder": num,
            "tmoney": num * num, 
            "allorder": Todata.allorder + num,
            "allmoney": Todata.allmoney + num * num
          }
        });
      } else {
        this.setState({
          mapUserData: mapuserdata(),
          currentDate: moment(new Date()).format("YYYY/MM/DD  HH:mm:ss"),
          Todata: {
            "torder": Todata.torder + num,
            "tmoney": Todata.tmoney + num * num,
            "allorder": Todata.allorder + num,
            "allmoney": Todata.allmoney + num * num
          }
        });
      }
    }, 1000);


    window.onresize = () => {
      // const offsetH = document.documentElement.offsetHeight || document.body.offsetHeight;
      const ht = document.documentElement.clientHeight || document.body.clientHeight;
      const chartsHt = ht * 6 / 7 - 70;
      this.setState({
        screenHt: ht,
        height: chartsHt,
      });
    }

  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }


  render() {
    const Todata = this.state.Todata;
    const mapUserData = this.state.mapUserData;
    const currentDate = this.state.currentDate;
    const { height, screenHt } = this.state;

    const cloudCols = {
      month: {
        alias: "店铺收费数据"
      },
      acc: {
        min: 0,
        max: 1200
      }
    };

    const kfData = [{
      day: '09-01',
      count: 89,
    }, {
      day: '09-02',
      count: 90,
    }, {
      day: '09-03',
      count: 86,
    }, {
      day: '09-04',
      count: 88,
    }, {
      day: '09-05',
      count: 92,
    }]

    const cloudMoneyData = require('./cloudMoneyData');
    const lineOrderData = require('./lineOrderData');
    const orderData = require('./orderData.json');
    const storeData = require('./storeData.json');
    const storeAddr = require('./storeAddr.json');
    const ds = new DataSet();

    //连锁店
    const dv = ds.createView().source(storeData ? storeData : []);
    dv.transform({
      type: "fold",
      fields: ["Jul.17", "Aug.17", "Sep.17", "Oct.17", "Nov.17", "Dec.17", "Jan.17", "Feb.17", "Mar.17", "Apr.17", "May.17", "Jun.17"],
      // 展开字段集
      key: "月份",
      // key字段
      value: "连锁店数据" // value字段
    });
    const parkCols = {
      连锁店数量: {
        min: 200,
        max: 1200,
      },
      月份: {
        alias: '连锁店增长数据'
      }
    }
    const parkTickLine = {
      length: 5
    }
    let chartInst = null;


    //月订单与交易额表
    const orderDv = ds.createView().source(orderData ? orderData : []);
    const orderCols = {
      time: {
        alias: '月订单数与月交易额'
      },
      order: {
        min: 0,
        alias: '月订单数量'
      },
      money: {
        min: 0,
        alias: '月交易额'
      }
    }
    let chartIns = null;

    //平台累计订单与交易额表
    const lineOrderDv = ds.createView().source(lineOrderData ? lineOrderData : []);
    const lineOrderCols = {
      month: {
        alias: '店铺累计订单与交易额'
      },
      allOrder: {
        alias: '店铺累计订单总数（万单）',
        min: 0
      },
      allMoney: {
        alias: '店铺累计金额总数（万元）',
        ticks: [4000, 7000, 10000, 13000],
        min: 2000,
        max: 16000,
      }
    }
    let chartIn = null;


    const kfcols = {
      day: {
        alias: '单店员人效/单/天',
      },
      count: {
        alias: '数量',
      }
    }
    const val = this.state.data[0].value;
    const { lineWidth } = this.state;




    //绘制地图
    const chinaMap = require('./cn.json');
    const mapCols = {
      x: { sync: true, nice: false, range: [0, 1] },
      y: { sync: true, nice: false, range: [0, 1] },
      name: {
        alias: '省份'
      },
      value: {
        alias: '当前订单'
      },
      lat: {
        alias: '纬度'
      },
      lng: {
        alias: '经度'
      }
    }

    const mapDv = ds.createView('back').source(chinaMap, {
      type: "GeoJSON"
    })
      .transform({
        type: "geo.projection",
        projection: "geoMercator",
        as: ["x", "y", "centroid_x", "centroid_y"]
      });

    //地图用户数据
    const userData = ds.createView().source(mapUserData ? mapUserData : []);
    // console.log(userData);
    userData.transform({
        type: "map",
        callback: obj => {
          mapDv.rows.map(item => {
            // console.log(item);
            const projectedCoord = dv.geoProjectPosition(
              [obj.lng * 1, obj.lat * 1],
              "geoMercator"
            );
            if (obj.adcode == item.properties.adcode) {
              obj.lat = item.properties.centroid[1];
              obj.lng = item.properties.centroid[0];
            }
            obj.x = projectedCoord[0];
            obj.y = projectedCoord[1];
          });
          return obj;
        }
      });

    //地理分布比例
    const parkSiteDv = ds.createView().source(storeAddr ? storeAddr : []);
    parkSiteDv.transform({
      type: 'percent',
      field: 'value',
      dimension: 'name',
      as: 'percent'
    });

    const parkSiteCols = {
      percent: {
        formatter: val => {
          val = (val * 100) + '%';
          return val;
        }
      }
    }


    //注册用户
    const registerUserData = require('./registerUser.json');
    const registerDv = ds.createView().source(registerUserData ? registerUserData : []);
    registerDv.transform({
      type: "fold",
      fields: ["Jul.17", "Aug.17", "Sep.17", "Oct.17", "Nov.17", "Dec.17", "Jan.17", "Feb.17", "Mar.17", "Apr.17", "May.17", "Jun.17"],
      // 展开字段集
      key: "time",
      // key字段
      value: "user"
      // value字段
    });
    const registerCols = {
      time: {
        alias: '注册用户'
      }
    }

    return (
      <div style={{ width: '100%', height: '100%' }}>
        {/* 图片背景   */}
        <img src={require('../imgs/bgimg.png')} className={styles.bgImg} />
        <Row>
          <Col>
            <div className={styles.title} style={{ height: screenHt / 7 }}>
              <p className={styles.name}>连锁店铺数据展示</p>
              <div className={styles.Torder}>
                <div className={styles.order}>
                  <h3>今日支付单数：<span>{Todata ? Todata.torder : []}单</span></h3>
                  <p>累计支付单数：<span>{Todata ? Todata.allorder : []}单</span></p>
                </div>
                <div className={styles.money}>
                  <h3>今日支付金额：<span>{Todata ? Todata.tmoney : []}元</span></h3>
                  <p>累计支付金额：<span>{Todata ? Todata.allmoney : []}元</span></p>
                </div>
              </div>
              <div className={styles.logo}>
                <img src={require('../imgs/logo.png')} />
                <p>当前时间：{moment(currentDate).format("YYYY/MM/DD  HH:mm:ss") ? moment(currentDate).format("YYYY/MM/DD  HH:mm:ss") : moment(new Date()).format("YYYY/MM/DD  HH:mm:ss")}</p>
              </div>
            </div>
          </Col>
        </Row>
        <Row style={{ marginTop: 8, paddingLeft: 5, paddingRight: 5 }}>
          <Col sm={24} md={12} lg={7} xl={7}>
            <Row gutter={{ md: 8, xl: 16 }}>
              <Col span={24}>
                <div className={styles.chartWrapLeft}>
                  <Chart
                    data={dv}
                    forceFit height={height / 3}
                    scale={parkCols}
                    padding={[40, 30, 110, 20]}
                    onGetG2Instance={chart => {
                      chartInst = chart;
                    }}
                  >
                    <Axis
                      name="月份"
                      line={{
                        lineWidth: 1,
                        stroke: '#00a0e9'
                      }}
                      label={{
                        textStyle: {
                          fill: '#0068b7'
                        }
                      }}
                      title={{
                        textStyle: {
                          fill: '#f4b41a'
                        },
                      }}
                    />

                    <Axis
                      name="连锁店数据"
                      grid={null}
                      line={{ lineWidth: 1 }}
                      tickLine={parkTickLine}
                      label={null}
                    />
                    <Legend
                      custom={true}
                      items={[
                        {
                          value: "连锁店数量",
                          marker: {
                            symbol: "hyphen",
                            stroke: "#12395d",
                            lineWidth: 5,
                          }
                        },
                        {
                          value: "店员数量",
                          marker: {
                            symbol: "hyphen",
                            stroke: "#0068b7",
                            lineWidth: 5,
                          }
                        }
                      ]}
                      onClick={ev => {
                        const item = ev.item;
                        const value = item.value;
                        const checked = ev.checked;
                        const geoms = !!chartInst ? chartIns.getAllGeoms() : '';

                        for (let i = 0; i < geoms.length; i++) {
                          const geom = geoms[i];

                          if (geom.getYScale().field === value) {
                            if (checked) {
                              geom.show();
                            } else {
                              geom.hide();
                            }
                          }
                        }
                      }}
                    />
                    <Tooltip />
                    <Geom
                      type="intervalStack"
                      position="月份*连锁店数据"
                      color={['name', ['#12395d', '#0068b7']]}
                      adjust={[
                        {
                          type: "dodge",
                          marginRatio: 1 / 10
                        }
                      ]}
                    />
                  </Chart>
                </div>
              </Col>
            </Row>
            <Row gutter={{ md: 8, xl: 16 }}>
              <Col span={24}>
                <div className={styles.chartWrapLeft} style={{ marginTop: 10, marginBottom: 10 }}>
                  <Chart height={height / 3} data={cloudMoneyData} scale={cloudCols} forceFit padding={[40, 30, 110, 20]}>
                    <Axis
                      name="month"
                      tickLine={null}
                      line={{
                        stroke: '#00a0e9'
                      }}
                      title={{
                        textStyle: {
                          fill: '#f4b41a'
                        }
                      }}
                      label={{
                        textStyle: {
                          fill: '#0068b7'
                        }
                      }}
                    />
                    <Axis
                      name="acc"
                      grid={null}
                      label={null}
                    />
                    <Legend />
                    <Tooltip
                      crosshairs={{
                        type: "line"
                      }}
                    />
                    <Geom
                      type="point"
                      tooltip={false}
                      position="month*acc"
                      shape="circle"
                      color="#f41a71"
                    />
                    <Geom
                      type="line"
                      position="month*acc"
                      size={2}
                      color="#f41a71"
                      tooltip={['month*acc', (month, acc) => {
                        return {
                          value: '云服务收费金额（万元）：￥' + acc
                        }
                      }]}
                    />
                  </Chart>
                </div>
              </Col>
            </Row>
            <Row>
              <div className={styles.chartWrapLeft}>
                <Col span={12}>
                  <Chart height={height / 3} data={this.state.data} scale={cols} padding={[0, 0, 50, 0]} forceFit>
                    <Coord type="polar" startAngle={-5 / 4 * Math.PI} endAngle={1 / 4 * Math.PI} radius={0.6} />
                    <Axis
                      name="value"
                      zIndex={2}
                      line={null}
                      label={null}
                      tickLine={{
                        lineWidth: 1,
                        stroke: '#fff',
                        length: -15,
                      }}
                    />
                    <Axis name="1" line={null} />
                    <Guide>
                      <Arc zIndex={0} start={[0, 0.965]} end={[10, 0.965]} style={{
                        // 底灰色
                        stroke: 'rgba(200, 205, 205, 0.3)',
                        lineWidth
                      }} />
                      {0 < val <= 10 && <Arc zIndex={2} start={[0, 0.965]} end={[val, 0.965]} style={{
                        stroke: 'l(0) 0:#8faf24  1:#d0371d',
                        lineWidth
                      }} />}
                      <Html position={['50%', '95%']} html={() => `<div style="width: 300px;text-align: center;font-size: 12px!important;"><p style="font-size: 2em; color: rgba(255,255,255,0.8);margin: 0;margin-top: -10px;">${val * 10}%</p><p style="font-size: 12px;color: #f4b41a;margin: 0;">店铺好评率</p></div>`} />
                    </Guide>
                    <Geom type="point" position="value*1" shape="pointer" color="#1890FF" active={false} style={{
                      stroke: '#fff',
                      lineWidth: 1
                    }} />
                  </Chart>
                </Col>
                <Col span={12}>
                  <Chart height={height / 3} data={kfData} scale={kfcols} forceFit padding={[20, 30, 100, 40]}>
                    <Legend />
                    <Axis
                      name="day"
                      tickLine={null}
                      line={{
                        stroke: '#00a0e9'
                      }}
                      label={null}
                      title={{
                        textStyle: {
                          fontSize: '12',
                          textAlign: 'center',
                          fill: '#f4b41a',
                        }
                      }}
                    />
                    <Axis
                      name="count"
                      grid={null}
                      label={{
                        textStyle: {
                          fill: '#0068b7',
                        }
                      }}
                    />
                    <Tooltip
                      crosshairs={{
                        type: "y"
                      }}
                    />
                    <Geom
                      type="intervalStack"
                      position="day*count"
                      color="#0068b7"
                    // size={2}
                    // color={"#1bbbec"}
                    // shape={"smooth"}
                    />
                    {/* <Geom
                      type="point"
                      position="day*count"
                      size={4}
                      shape={"circle"}
                      color={"#1bbbec"}
                      style={{
                        lineWidth: 1
                      }}
                    /> */}
                  </Chart>
                </Col>
              </div>
            </Row>
          </Col>
          <Col sm={24} md={12} lg={10} xl={10}>
            <Row>
              <Col span={24} style={{ paddingLeft: 5, paddingRight: 5 }}>
                <div className={styles.mapWrap}>
                  <div className={styles.mapTitle}>连锁店铺实时交易订单显示（中国）</div>
                  <Chart height={height * 2 / 3 + 14} scale={mapCols} forceFit padding={[10, 50, 10, 50]}>
                    <Coord reflect />
                    <Legend visible={false} />
                    <Axis visible={false} />
                    <Tooltip
                      showTitle={false}
                    />
                    <View data={mapDv}>
                      <Geom
                        type='polygon'
                        tooltip={false}
                        position='x*y'
                        style={{
                          fill: '#57b7ea',
                          lineWidth: 1,
                          stroke: 'rgb(74,187,231)',
                          fillOpacity: 0
                        }}
                      />
                    </View>
                    <View data={userData} >
                      <Geom
                        type='point'
                        position='x*y'
                        shape='circle'
                        size={["value", [5, 20]]}
                        opacity={0.7}
                        color="#65baec"
                        tooltip="name*lat*lng*value"
                      />
                    </View>
                  </Chart>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={24} style={{ paddingLeft: 5, paddingRight: 5 }}>
                <div className={styles.mapWrap} style={{ marginTop: 10 }}>
                  <Chart
                    data={lineOrderDv}
                    forceFit
                    height={height / 3}
                    padding={[20, 40, 100, 50]}
                    scale={lineOrderCols}
                    onGetG2Instance={chart => {
                      chartIn = chart;
                    }}
                  >
                    <Axis
                      name="month"
                      title={{
                        textStyle: {
                          fill: '#f4b41a'
                        }
                      }}
                      line={{
                        stroke: '#00a0e9'
                      }}
                      label={{
                        textStyle: {
                          fill: '#0068b7'
                        }
                      }}
                    />
                    <Axis
                      name="allMoney"
                      grid={null}
                      label={null}
                    />
                    <Axis
                      name="allOrder"
                      grid={null}
                      label={null}
                    />
                    <Legend
                      custom={true}
                      items={[
                        {
                          value: "allMoney",
                          marker: {
                            symbol: "hyphen",
                            stroke: "#0068b7",
                            radius: 5,
                            lineWidth: 5
                          }
                        },
                        {
                          value: "allOrder",
                          marker: {
                            symbol: "hyphen",
                            stroke: "#0068b7",
                            radius: 5,
                            lineWidth: 5
                          }
                        }
                      ]}
                      itemFormatter={val => {
                        const value = val == "allMoney" ? "平台累计金额（万元）" : "平台累计订单（万单）"
                        return value;
                      }}
                      onClick={ev => {
                        const item = ev.item;
                        const value = item.value;
                        const checked = ev.checked;
                        const geoms = !!chartIn ? chartIn.getAllGeoms() : '';

                        for (let i = 0; i < geoms.length; i++) {
                          const geom = geoms[i];

                          if (geom.getYScale().field === value) {
                            if (checked) {
                              geom.show();
                            } else {
                              geom.hide();
                            }
                          }
                        }
                      }}
                    />
                    <Tooltip />
                    <Geom
                      type="interval"
                      position="month*allMoney"
                      color='#0068b7'
                    />
                    <Geom
                      type="line"
                      position="month*allOrder"
                      // shape="smooth"
                      color='#0068b7'
                    />
                    <Geom
                      type="point"
                      position="month*allOrder"
                      shape="circle"
                      color='#0068b7'
                    />
                  </Chart>
                </div>
              </Col>
            </Row>
          </Col>
          <Col sm={24} md={24} lg={7} xl={7} >
            <Row>
              <Col>
                <div className={styles.chartWrapRight}>
                  <Chart
                    height={height / 3}
                    data={orderDv}
                    scale={orderCols}
                    forceFit
                    padding={[0, 30, 100, 20]}
                    onGetG2Instance={chart => {
                      chartIns = chart;
                    }}
                  >
                    <Legend
                      custom={true}
                      items={[
                        {
                          value: "money",
                          marker: {
                            symbol: "hyphen",
                            stroke: "#f4b41a",
                            lineWidth: 5,
                          }
                        },
                        {
                          value: "order",
                          marker: {
                            symbol: "hyphen",
                            stroke: "#f41a71",
                            lineWidth: 5,
                          }
                        }
                      ]}
                      onClick={ev => {
                        const item = ev.item;
                        const value = item.value;
                        const checked = ev.checked;
                        const geoms = !!chartIns ? chartIns.getAllGeoms() : '';

                        for (let i = 0; i < geoms.length; i++) {
                          const geom = geoms[i];

                          if (geom.getYScale().field === value) {
                            if (checked) {
                              geom.show();
                            } else {
                              geom.hide();
                            }
                          }
                        }
                      }}
                      itemFormatter={val => {
                        return val == "money" ? "月交易额" : "月订单数";
                      }}
                    />
                    <Axis
                      name="time"
                      line={{
                        stroke: '#00a0e9'
                      }}
                      title={{
                        textStyle: {
                          fill: '#f4b41a'
                        }
                      }}
                      label={{
                        textStyle: {
                          fill: '#0068b7'
                        }
                      }}
                      tickLine={null}
                    />
                    <Axis
                      name="money"
                      grid={null}
                      label={null}
                    />
                    <Axis
                      name="order"
                      grid={null}
                      label={null}
                    />
                    <Tooltip crosshairs={{ type: "y" }} />
                    <Geom
                      type="line"
                      position="time*order"
                      size={2}
                      color={'#f41a71'}
                      shape={'smooth'}
                    />
                    <Geom
                      type="line"
                      position="time*money"
                      size={2}
                      color={'#f4b41a'}
                      shape={'smooth'}
                    />
                    <Geom
                      type='point'
                      tooltip={false}
                      position="time*money"
                      shape={'circle'}
                      color="#f4b41a"
                    />
                    <Geom
                      type='point'
                      tooltip={false}
                      position="time*order"
                      shape={'circle'}
                      color="#f41a71"
                    />
                  </Chart>
                </div>
              </Col>
            </Row>
            <Row>
              <Col>
                <div className={styles.chartWrapRight} style={{ marginTop: 10, marginBottom: 10 }}>
                  <div className={styles.parkCharts}><h2>连锁店地理分布</h2></div>
                  <Chart height={height / 3} data={parkSiteDv} scale={parkSiteCols} padding={[50, 100, 50, 20]} forceFit>
                    <Coord type='theta' radius={1} />
                    <Axis name="percent" />
                    <Legend position='right' />
                    <Tooltip
                      showTitle={false}
                      itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
                    />
                    <Geom
                      type="intervalStack"
                      position="percent"
                      color='name'
                      tooltip={['name*percent', (name, percent) => {
                        percent = (percent * 100).toFixed(2) + '%';
                        return {
                          name: name,
                          value: percent
                        };
                      }]}
                      style={{ lineWidth: 1, stroke: '#fff' }}
                    >
                      <Label
                        content='percent'
                        textStyle={{
                          fill: '#aaf537'
                        }}
                        formatter={(val, item) => {
                          let percent = (item.point.percent * 100).toFixed(2) + '%';
                          return item.point.name + ': ' + percent;
                        }}
                      />
                    </Geom>
                  </Chart>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <div className={styles.chartWrapRight}>
                  <Chart
                    data={registerDv}
                    height={height / 3}
                    forceFit
                    scale={registerCols}
                    padding={[0, 30, 100, 20]}
                  >
                    <Axis
                      name="time"
                      line={{
                        stroke: '#00a0e9'
                      }}
                      label={{
                        textStyle: {
                          fill: '#0068b7'
                        }
                      }}
                      title={{
                        textStyle: {
                          fill: '#f4b41a'
                        }
                      }}
                      tickLine={null}
                    />
                    <Axis
                      name="user"
                      label={null}
                      tickLine={null}
                      grid={null} />
                    <Tooltip
                      crosshairs={{
                        type: 'y'
                      }}
                    />
                    <Geom
                      type="line"
                      position="time*user"
                      size={2}
                      color={['name', ['#f4b41a']]}
                      tooltip={['time*user', (time, user) => {
                        return {
                          value: '注册用户数量（万人）：' + user
                        }
                      }]}
                    // shape={"smooth"}
                    />
                    <Geom
                      type="point"
                      position="time*user"
                      size={4}
                      color={['name', ['#f4b41a']]}
                      shape="circle"
                      tooltip={null}
                    />
                  </Chart>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Charts;