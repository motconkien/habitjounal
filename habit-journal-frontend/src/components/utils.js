import API from "../api";
import { LineChart } from "@mui/x-charts";
//fetch api 


const numericToMoodLabel = {
    "happy": 9,
    "fun": 8,
    "productive": 7,
    "calm": 6,
    "bored": 5,
    "tired": 4,
    "anxious": 3,
    "fearful": 2,
    "sad": 1,
    "angry": 0,
  };

  const moodLabelFromValue = {
    9: "😄",     // happy
    8: "🎉",     // fun
    7: "🚀",     // productive
    6: "😌",     // calm
    5: "😐",     // bored
    4: "😩",     // tired
    3: "😟",     // anxious
    2: "😨",     // fearful
    1: "😢",     // sad
    0: "😠",     // angry
  };

  
const gettimeline = () => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i)); // oldest first, today last
      return d.toISOString().split("T")[0];
    });
  };

const mooddata = (journals) => {
    const mood = [...journals]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(journal => ({
            x: journal.date,
            y: numericToMoodLabel[journal.mood],
        }));
    return mood
    }

const moodChart = (moodSeries, xAxisDays ) => {
    return (<LineChart
        series={[
            {
                data: moodSeries,
                color: "#96529b"
            },
        ]}
        xAxis={[
            {
                scaleType: "band",
                data: xAxisDays,
            }
        ]}
        yAxis={[
            {
                min: 0,
                max: 9,
                tickMinStep: 1,// fixed values
                valueFormatter: (value) => moodLabelFromValue[value] ?? value,
            },
        ]}
        height={250}
        sx={{
            "& .MuiChartsAxis-line": {
                stroke: "#ffffff !important",
                strokeWidth: 1,
            },
            "& .MuiChartsAxis-tickLabel": {
                fill: "#ffffff !important",
                fontSize: 12,
            },
            "& .MuiChartsLegend-root": {
                color: "#ffffff !important",
            },

        }}
        slotProps={{ tooltip: { trigger: 'none' } }}
        highlightScope={{ highlighted: 'none', faded: 'none' }}

    />
)}

export  { 
    gettimeline, 
    mooddata, 
};
