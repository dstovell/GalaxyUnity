using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace GS
{

public class GalaxyViewGameflowState : GameflowState
{
	public GalaxyViewGameflowState() : base()
	{
	}

	public override void OnBegin(GameflowStateType previousState, object obj1, object obj2)
	{
		this.manager.SendMessengerMsg("galaxyview_onbegin");
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
			case "starview_selected":
			{
				this.manager.SetState(GameflowStateType.StarView, obj1);
				break;
			}
		}
	}
}

}
