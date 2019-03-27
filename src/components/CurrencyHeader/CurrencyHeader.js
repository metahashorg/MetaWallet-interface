import React from 'react';
import { LineChart, Line, Tooltip, YAxis, ResponsiveContainer } from 'recharts';
import './CurrencyHeader.css'

class CustomTooltip extends React.Component {
  render() {
    const { active } = this.props;

    if (active) {
      const { payload } = this.props;
      return (
        <div className="custom-tooltip">
          <div>$ {`${payload[0].value}`}</div>
        </div>
      );
    }

    return null;
  }
}

const CustomCursor = props => {
  let cx = props.points[0].x;
  let h = props.height;
  let cy = h - ((props.payload[0].value - props.min) * h / (props.max - props.min)) + 5;
    
  return (
    <React.Fragment>
      <circle cx={cx} cy={cy} r="4.7515" fill="#99CEFF" />
      <circle
        cx={cx}
        cy={cy}
        r="7.16436"
        fill="#99CEFF"
        opacity="0.1"
      />
      <circle
        cx={cx}
        cy={cy}
        r="9"
        fill="#99CEFF"
        opacity="0.1"
      />
    </React.Fragment>
  );
};

const CurrencyHeader = props => {
  let data = window.mhcData || [];
  let vals = data.map(x => x.val);
  let min = Math.min.apply(null, vals);
  let max = Math.max.apply(null, vals);
  let mhcCourse = vals[vals.length - 1];
  let mhcDiff = ((mhcCourse - vals[0]) / vals[0] * 100 || 0);
  let mhcDiffString = (mhcDiff > 0 ? '+' : '') + (mhcDiff).toFixed(2)
  
  return (
    <div>
      <div className="asset">
        <span className="asset__int">{props.usdBalanceFloor}.</span>
        <span className="asset__div">{props.usdBalanceResidue}</span>{' '}
        <span className="asset__cur">USD</span>
        <div className="asset__changes">
          <span className="asset__name">#MHC:</span>
          <span className="asset__val">{mhcCourse} USD</span>
          <span className={mhcDiff >= 0 ? "asset__type asset__type_inc" : "asset__type asset__type_dec"}>{mhcDiffString}%</span>
        </div>
      </div>
      <div className="chart" id="chart">
      <ResponsiveContainer width='90%' height={40}>
        <LineChart
          width={375}
          height={40}
          data={window.mhcData}>
          <YAxis domain={[min, max]} style={{display:'none'}} ></YAxis>
          <defs>
            <linearGradient
              id="paint1_linear"
              x1="0"
              y1="35"
              x2="0"
              y2="10"
              gradientUnits="userSpaceOnUse">
              <stop stop-color="#2F7BC2" />
              <stop stop-color="#04D67E" offset="1" />
            </linearGradient>
          </defs>
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey="val"
            strokeWidth={3}
            stroke="url(#paint1_linear)"
            dot={false}
            activeDot={false}
          />
          <Tooltip 
                 content={<CustomTooltip  />} 
                 cursor={<CustomCursor max={max} min={min} />} 
                 offset={10}
                 position="top"
                 />
        </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CurrencyHeader;
