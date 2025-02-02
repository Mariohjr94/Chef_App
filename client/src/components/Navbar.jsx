import { useState, useEffect } from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation, clearToken } from '../features/auth/authSlice';

function CustomNavbar() {
  const [menuExpanded, setMenuExpanded] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => !!state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();

  const handleToggle = () => setMenuExpanded(!menuExpanded);
  const closeMenu = () => setMenuExpanded(false);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearToken());
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <Navbar bg="light" expand="lg" expanded={menuExpanded} onToggle={handleToggle} className="fixed-top px-3 navbar">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          E<span style={{ color: '#ffc107' }}>CC</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" onClick={handleToggle} />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" navbarScroll>
            <Nav.Link as={Link} to="/" onClick={closeMenu}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/freezer-logger" onClick={closeMenu}>
              Freezer Logger
            </Nav.Link>
            {isLoggedIn && (
              <Nav.Link as={Link} to="/add-recipe" onClick={closeMenu}>
                Add Recipe
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            {isLoggedIn ? (
              <>
                <Nav.Link as={Link} to="/profile" onClick={closeMenu}>
                  {user?.username || 'Profile'}
                </Nav.Link>
                <Button variant="secondary" onClick={() => { handleLogout(); closeMenu(); }} className="ms-2">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/auth/login" onClick={closeMenu}>
                  Login
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
