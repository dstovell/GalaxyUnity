using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace GS
{

public class StarViewGameflowState : GameflowState
{
	private StarData starData = null;

	public StarViewGameflowState() : base()
	{
	}

	public override void OnBegin(GameflowStateType previousState, object obj1, object obj2)
	{
		StarData star = obj1 as StarData;
		if (star != null)
		{
			this.starData = star;
			this.manager.galaxyManager.GetStar(this.starData.id, delegate(string error) {
				//Debug.Log("GetStar() error=" + error);
			});
			this.manager.SendMessengerMsg("starview_onbegin", this.starData);
		}
	}

	public override void OnEnd(GameflowStateType nextState, object obj1, object obj2)
	{
	}

	public override void OnUpdate()
	{
	}

	public override void OnUpdateNotCurrent()
	{
	}

	public override void OnMessage(string id, object obj1, object obj2)
	{
		switch(id)
		{
			case "galaxyview_selected":
			{
				this.manager.SetState(GameflowStateType.GalaxyView, obj1);
				break;
			}

			case "solarsystemview_selected":
			{
				this.manager.SetState(GameflowStateType.SolarSystemView, obj1);
				break;
			}
			
			case "starview_selected":
			{
				this.OnBegin(GameflowStateType.StarView, obj1, null);
				break;
			}
		}
	}
}

}
