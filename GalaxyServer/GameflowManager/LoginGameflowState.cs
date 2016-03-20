using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace GS
{

public class LoginGameflowState : GameflowState
{
	public LoginGameflowState() : base()
	{
	}

	public override void OnBegin(GameflowStateType previousState, object obj1, object obj2)
	{
		this.manager.loginManager.LoginUser(delegate(string error, User user) {
			this.manager.galaxyManager.GetGalaxy(delegate(string error2) {
				this.manager.SetState(GameflowStateType.GalaxyView);
			});
		});
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
	}
}

}
