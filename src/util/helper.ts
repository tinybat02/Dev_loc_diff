import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
// import Heatmap from 'ol/layer/Heatmap'
import haversine from 'haversine-distance';
import { Coordinate } from 'ol/coordinate';
import { Circle as CircleStyle, Stroke, Style, Fill, Text } from 'ol/style';

interface Record {
  device_id: string;
  lat1: number;
  lat2: number;
  lon1: number;
  lon2: number;
  [key: string]: any;
}

export const processData = (data: Record[]) => {
  // data.reverse();

  const perDevice: { [key: string]: { point1: [number, number]; point2: [number, number] } } = {};

  data.map(datum => {
    if (!perDevice[datum.device_id]) {
      perDevice[datum.device_id] = { point1: [datum.lon1, datum.lat1], point2: [datum.lon2, datum.lat2] };
    }
  });

  return { perDevice };
};

// export const createHeatLayer = (data: [number, number][]) => {
//   const features = data.map(point => new Feature(new Point(point).transform('EPSG:4326', 'EPSG:3857')));

//   return new Heatmap({
//     source: new VectorSource({
//       features: features,
//     }),
//     blur: 15,
//     radius: 5,
//     opacity: 0.9,
//     zIndex: 2,
//   });
// };

export const createPoint = (coord: Coordinate, color: string) => {
  const pointFeature = new Feature(new Point(coord).transform('EPSG:4326', 'EPSG:3857'));
  pointFeature.setStyle(
    new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.7)',
        }),
        stroke: new Stroke({
          color: color, //'#00b2ae',
          width: 2,
        }),
      }),
    })
  );
  return pointFeature;
};

export const createLine = (p1: Coordinate, p2: Coordinate, label: string) => {
  const lineFeature = new Feature(new LineString([p1, p2]).transform('EPSG:4326', 'EPSG:3857'));
  lineFeature.setStyle([
    new Style({
      stroke: new Stroke({
        color: '#0ba1fd',
        width: 2,
      }),
      text: new Text({
        stroke: new Stroke({
          color: '#444',
          width: 1,
        }),
        font: '18px Calibri,sans-serif',
        text: label,
      }),
    }),
  ]);
  return lineFeature;
};

export const create_dev_diff = (data: { point1: [number, number]; point2: [number, number] }, device: string) => {
  const p1 = createPoint(data.point1, '#fd540b');
  const p2 = createPoint(data.point2, '#0ba1fd');

  const distance = haversine(data.point1, data.point2).toFixed(2);
  const line = createLine(data.point1, data.point2, `${device} - ${distance} m`);
  return new VectorLayer({
    source: new VectorSource({
      features: [p1, p2, line],
    }),
    zIndex: 3,
  });
};
