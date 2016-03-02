using UnityEngine;
using System.Collections;

namespace GS
{

public class Range
{
	public float min;
	public float max;
}

public static class Math 
{
	public static float lightYearsPerParsec = 3.26156f;

	public static float interpolateFloat(float min, float max, float t, bool _fixed) 
	{
		float range = (max - min);
		return min + t*range;
	}

	public static int interpolateInt(int min, int max, float t) 
	{
		return 1;
		//return Math.floor(exports.interpolateFloat(min, max, t));
	}

	/*exports.bvToRgb = function(bv) {    // RGB <0,1> <- BV <-0.4,+2.0> [-]
		var r;
		var g;
		var b;
		var t;  r=0.0; g=0.0; b=0.0; if (bv<-0.4) bv=-0.4; if (bv> 2.0) bv= 2.0;
		if ((bv>=-0.40)&&(bv<0.00)) { t=(bv+0.40)/(0.00+0.40); r=0.61+(0.11*t)+(0.1*t*t); }
		else if ((bv>= 0.00)&&(bv<0.40)) { t=(bv-0.00)/(0.40-0.00); r=0.83+(0.17*t)          ; }
		else if ((bv>= 0.40)&&(bv<2.10)) { t=(bv-0.40)/(2.10-0.40); r=1.00                   ; }
		if ((bv>=-0.40)&&(bv<0.00)) { t=(bv+0.40)/(0.00+0.40); g=0.70+(0.07*t)+(0.1*t*t); }
		else if ((bv>= 0.00)&&(bv<0.40)) { t=(bv-0.00)/(0.40-0.00); g=0.87+(0.11*t)          ; }
		else if ((bv>= 0.40)&&(bv<1.60)) { t=(bv-0.40)/(1.60-0.40); g=0.98-(0.16*t)          ; }
		else if ((bv>= 1.60)&&(bv<2.00)) { t=(bv-1.60)/(2.00-1.60); g=0.82         -(0.5*t*t); }
		if ((bv>=-0.40)&&(bv<0.40)) { t=(bv+0.40)/(0.40+0.40); b=1.00                   ; }
		else if ((bv>= 0.40)&&(bv<1.50)) { t=(bv-0.40)/(1.50-0.40); b=1.00-(0.47*t)+(0.1*t*t); }
		else if ((bv>= 1.50)&&(bv<1.94)) { t=(bv-1.50)/(1.94-1.50); b=0.63         -(0.6*t*t); }

		return {r:r,g:g,b:b};
	};*/

	/*exports.rgbToHex = function(red, green, blue) {
		var rgb = blue | (green << 8) | (red << 16);
		return '#' + (0x1000000 + rgb).toString(16).slice(1);
	};*/

	/*exports.bvToHex = function(bv) {
		var colour = exports.bvToRgb(bv);
		return exports.rgbToHex(colour.r, colour.g, colour.b);
	};*/

	public static float getStarRadius(float M) 
	{
		if (M == 1.0f) 
		{
			return 1.0f;
		}
		else if (M < 1.0f) 
		{
			return Mathf.Pow(M, 0.8f);
		}
		else 
		{
			return Mathf.Pow(M, 0.5f);
		}
	}

	public static float getStarLuminosity(float M) 
	{
		return Mathf.Pow(M, 3.5f);
	}

	public static float getStarTemperature(float M) 
	{
		float L = getStarLuminosity(M);
		float R = getStarRadius(M);
		return Mathf.Pow( (L/Mathf.Pow(R, 2.0f)), 0.25f);
	}

	public static Range getStarHabitableZone(float M) 
	{
		float L = getStarLuminosity(M);
		Range zone = new Range();
		zone.min = Mathf.Sqrt( L / 1.1f );
		zone.max = Mathf.Sqrt( L / 0.53f );
		return zone;
	}

	public static Range getStarPlanetZone(float M) 
	{
		Range zone = new Range();
		zone.min = 0.1f * M;
		zone.max = 40.0f * M;
		return zone;
	}

	public static float getStarFrostPoint(float M) 
	{
		float L = getStarLuminosity(M);
		return 4.85f * Mathf.Sqrt( L );
	}


	/*exports.generateSpiral = function(startPoint, openingRate, arcLength, startAngle) 
	{
		var maxAngle = arcLength * 2 * Math.PI + startAngle;
		var segmentArc = 0.05;
		var r = 10;
		var arc = [];
		for (var t=startAngle;t<maxAngle;t+=segmentArc) { 
			var p = {};
			p.x = startPoint.x + r*Math.cos(t);
			p.y = startPoint.x + r*Math.sin(t);
			arc.push(p);
			r += openingRate;
		}
		return arc;
	};

	exports.generateSpirals = function(center, spiralConfig) {
		var spirals = [];
		var spiralInc = 2*Math.PI/spiralConfig.count;
		for (var i=0; i<spiralConfig.count; i++) {
			var arc = exports.generateSpiral(center, spiralConfig.openingRate, spiralConfig.arcLength, i*spiralInc);
			spirals.push(arc);
		}
		return spirals;
	};

	exports.distToSegmentSquared = function(p, v, w) {
		var l2 = exports.getDistance(v, w);
		if (l2 === 0) {
			return exports.getDistance(p, v);
		}
		var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
		if (t < 0) {
			return exports.getDistance(p, v);
		}
		if (t > 1) {
			return exports.getDistance(p, w);
		}
		return exports.getDistance(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
	};

	exports.getDistanceFromArc = function(pos, arc) {
		arc = arc || [];
		//console.log("getDistanceFromArc arc=" + arc.length);
		var minDist = Number.MAX_VALUE;
		for (var i=1; i<arc.length; i++) {
			var lastPos = arc[i-1];
			var nextPos = arc[i];
			var dist = exports.distToSegmentSquared(pos, lastPos, nextPos);
			//console.log("distToSegmentSquared=" + dist);
			minDist = Math.min(minDist, dist);
		}
		return Math.sqrt(minDist);
	};

	exports.getDistanceFromArcArray = function(pos, arcs) {
		var minDist = Number.MAX_VALUE;
		//var start = new Date().getTime();
		for (var i=0; i<arcs.length; i++) {
			var dist = exports.getDistanceFromArc(pos, arcs[i]);
			minDist = Math.min(minDist, dist);
		}
		//console.log("getDistanceFromArcArray dist=" + minDist + " took " + (new Date().getTime() - start) + "ms");
		return minDist;
	};

	exports.generateAABB = function(dimensions, options) {
		options = options || {};
		var dims = {};

		for (var d=0; d<exports.dimensionKeys.length; d++) {
			var dKey = exports.dimensionKeys[d];
			dims[dKey] = {min:(-1*dimensions[dKey]), max:dimensions[dKey]};
			dims[dKey].size = dims[dKey].max - dims[dKey].min;
		}

		return dims;
	};

	exports.generateAABBFromPoints = function(pointArray, options) {
		pointArray = pointArray || [];
		options = options || {};
		var multiplier = options.coordinateMult || 1;

		var bounds = options.bounds || {}
			for (var d=0; d<exports.dimensionKeys.length; d++) {
				var dKey = exports.dimensionKeys[d];
				bounds[dKey] = bounds[dKey] || Number.MAX_VALUE;
			}

				var dims = {};

			for (var i=0; i<pointArray.length; i++) {
				var point = pointArray[i];
				var insideBounds = true;

				for (var d=0; d<exports.dimensionKeys.length; d++) {
					var dKey = exports.dimensionKeys[d];
					bounds[dKey] = bounds[dKey] || Number.MAX_VALUE;

					if (Math.abs(point[dKey]) > bounds[dKey]) {
						insideBounds = false;
						break;
					}
				}
				if (!insideBounds) {
					continue;
				}

				for (var d=0; d<exports.math.dimensionKeys.length; d++) {
					var dKey = exports.dimensionKeys[d];

					dims[dKey] = dims[dKey] || {min:Number.MAX_VALUE, max:Number.MIN_VALUE};
					dims[dKey].min = Math.min(dims[dKey].min, (point[dKey]*multiplier));
					dims[dKey].max = Math.max(dims[dKey].max, (point[dKey]*multiplier));
					dims[dKey].size = dims[dKey].max - dims[dKey].min;
				}
			}

			return dims;
	};*/
}

}
