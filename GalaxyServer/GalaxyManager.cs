using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using SimpleJSON;

namespace GS
{
	public class PlanetData
	{
		public PlanetData(int _id, JSONNode json)
		{
			this.id = ResultParse.Int("id", json, _id);
			this.OribitalDistance = ResultParse.Float("od", json, 0.0f);
			this.Mass = ResultParse.Float("M", json, 0.0f);
			this.Diameter = ResultParse.Float("sz", json, 0.0f);
			this.Class = ResultParse.String("c", json, string.Empty);
			this.ClassName = ResultParse.String("cn", json, string.Empty);
		}

		public int id;
		public float OribitalDistance;
		public float Mass;
		public float Diameter;
		public string Class;
		public string ClassName;
	}

	public class StarData
	{
		public StarData(JSONNode json)
		{
			this.id = ResultParse.Int("id", json, 0);
			this.Mass = ResultParse.Float("M", json, 0.0f);
			this.Class = ResultParse.String("c", json, string.Empty);
			this.Position = ResultParse.Vector(json, Vector3.zero);

			this.Planets = new List<PlanetData>();
			JSONClass planets = ResultParse.Object("planets", json, ResultParse.EmptyObject);
			for (int i = 0; i<planets.Count; i++) 
			{
				this.Planets.Add(new PlanetData(i, planets[i]) );
			}
		}

		public int id;
		public Vector3 Position;
		public float Mass;
		public string Class;

		public List<PlanetData> Planets;

		public float Radius	{ get {	return GS.Math.getStarRadius(this.Mass); } }
		public float Luminosity { get {	return GS.Math.getStarLuminosity(this.Mass); } }
		public float Temperature { get { return GS.Math.getStarTemperature(this.Mass); } }
		public float FrostPoint	{ get { return GS.Math.getStarFrostPoint(this.Mass); } }
		public Range HabitableZone { get { return GS.Math.getStarHabitableZone(this.Mass); } }
		public Range PlanetZone { get { return GS.Math.getStarPlanetZone(this.Mass); } }
	}

	public class GalaxyManager : SystemManager
	{
		void Awake()
		{
			//Put in parent
			this.state = GS.SystemManager.State.Initial;
		}

		public delegate void OnData(string error);

		public void GetGalaxy(OnData cb) 
		{
			this.Get("/api/galaxy/getGalaxy", delegate(string error, JSONNode json) {
				if (!string.IsNullOrEmpty(error)) 
				{
					cb(error);
					return;
				}

				this.state = GS.SystemManager.State.Ready;
				//this.LocalUser = new User(json);
				cb(null);
				return;
			});
		}

		public void GetStar(int starId, OnData cb) 
		{
			this.Get("/api/galaxy/getStar"+starId, delegate(string error, JSONNode json) {
				if (!string.IsNullOrEmpty(error)) 
				{
					return cb(error);
				}

				return cb(null);
			});
		}
	}

}

