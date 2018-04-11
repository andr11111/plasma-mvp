pragma solidity ^0.4.4;

contract DSAuthority {
  function canCall(
    address src, address dst, bytes4 sig
  ) public view returns (bool);
}

contract DSAuthEvents {
  event LogSetAuthority (address indexed authority);
  event LogSetOwner     (address indexed owner);
}

contract DSAuth is DSAuthEvents {
  DSAuthority  public  authority;
  address      public  owner;

  function DSAuth() public {
    owner = msg.sender;
    LogSetOwner(msg.sender);
  }

  function setOwner(address owner_)
  public
  auth
  {
    owner = owner_;
    LogSetOwner(owner);
  }

  function setAuthority(DSAuthority authority_)
  public
  auth
  {
    authority = authority_;
    LogSetAuthority(authority);
  }

  modifier auth {
    require(isAuthorized(msg.sender, msg.sig));
    _;
  }

  function isAuthorized(address src, bytes4 sig) internal view returns (bool) {
    if (src == address(this)) {
      return true;
    } else if (src == owner) {
      return true;
    } else if (authority == DSAuthority(0)) {
      return false;
    } else {
      return authority.canCall(src, this, sig);
    }
  }
}
