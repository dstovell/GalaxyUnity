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

	public override void OnBegin()
	{
		Messenger.SendMessageFrom("GameflowManager", "fade_in");
	}

	public override void OnEnd()
	{
	}

	public override void OnUpdate()
	{
	}

	public override void OnUpdateNotCurrent()
	{
	}

	public override bool OnMessage(string id, object obj1, object obj2)
	{
		return false;
	}
}

}
