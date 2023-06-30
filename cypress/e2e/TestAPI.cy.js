import { faker } from '@faker-js/faker'

export const getRandomPostsData = () => {
  return {
    body: faker.person.bio(),
    title: faker.person.jobTitle(),
  }
}

const checkPost = (responsePost, expectedPost) => {
  expect(responsePost.id).to.eq(expectedPost.id);
  expect(responsePost.body).to.eq(expectedPost.body);
  expect(responsePost.title).to.eq(expectedPost.title);
}

describe('API', () => {
  let posts = {};
  beforeEach(() => {
    posts = getRandomPostsData();
  })

  it('API1', () => {
    cy.log('Get all posts. Verify HTTP response status code and content type')
    cy.request('GET', 'http://localhost:3000/posts/').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers['content-type']).to.eq('application/json; charset=utf-8')
    });
  })

  it('API2', () => {
    cy.log('Get only first 10 posts. Verify HTTP response status code. Verify that only first posts are returned')
    cy.request('GET', 'http://localhost:3000/posts?_limit=10').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers['content-type']).to.eq('application/json; charset=utf-8')
      expect(response.body.length).to.eq(10);
    });
  })

  it('API3', () => {
    cy.log('Get posts with id = 55 and id = 60. Verify HTTP response status code. Verify id values of returned records')
    cy.request('GET', 'http://localhost:3000/posts?id=55&id=60').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers['content-type']).to.eq('application/json; charset=utf-8')
      expect(response.body.length).to.eq(2);
      expect(response.body[0].id).to.eq(55);
      expect(response.body[1].id).to.eq(60);
    });
  })

  it('API4', () => {
    cy.log('Create a post. Verify HTTP response status code')
    cy.log(JSON.stringify(posts))
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/664/posts',
      body: posts,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  })

  it('API5', () => {
    const loginData = {
      email: "olivier@mail.cocmw",
      password: "bestPassw0rd",
    };

    const newPost = (accessToken) => {
      cy.log('Create post with adding access token in header. Verify HTTP response status code')
      cy.log(JSON.stringify(posts))
      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/664/posts',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: posts,
      }).then((response) => {
        expect(response.status).to.eq(201);
        posts.id = response.body.id;
      });
    }

    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/register',
      body: loginData,
      failOnStatusCode: false,
    })
      .then((responseRegistration) => {
        if (responseRegistration.status === 400) {
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/login',
            body: loginData,
          }).then((responseLogin) => {
            newPost(responseLogin.body.accessToken)
          })
        } else {
          newPost(responseRegistration.body.accessToken)
        }
      })
      .then(() => {
        cy.log('Verify post is created. Verify HTTP response status code')
        cy.log(JSON.stringify(posts))
        cy.request('GET', `http://localhost:3000/posts/${posts.id}`)
          .then((response) => {
            expect(response.status).to.eq(200);
            checkPost(response.body, posts);
          })
      })
  })

  it('API6', () => {
    let newPost = {
      "email": "olivier@mail.com",
      "password": "bestPassw0rd",
      "firstname": "Olivier",
      "lastname": "Monge",
      "age": 32
    }
    cy.log('Create post entity. Verify HTTP response status code')
    cy.log(JSON.stringify(newPost))
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/posts',
      body: newPost
    })
      .then((response) => {
        expect(response.status).to.eq(201);
        newPost.id = response.body.id;
      })
      .then(() => {
        cy.log('Verify that the entity is created. Verify HTTP response status code')
        cy.log(JSON.stringify(newPost))
        cy.request({
          method: 'GET',
          url: `http://localhost:3000/posts/${newPost.id}`,
        }).then((response) => {
          expect(response.status).to.eq(200);
          checkPost(response.body, newPost)
        });
      })
  })

  it('API7', () => {
    cy.log('Update non-existing entity. Verify HTTP response status code')
    cy.log(JSON.stringify(posts))
    cy.request({
      method: 'PUT',
      url: 'http://localhost:3000/posts',
      body: posts,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  })

  it('API8', () => {
    cy.log(`Create post entity ${posts.id}`)
    cy.log(JSON.stringify(posts))

    cy.request('POST', 'http://localhost:3000/posts', posts)
      .then((response) => {
        expect(response.status).to.eq(201);
        posts.id = response.body.id
      })
      .then(() => {
        cy.log(`Get post entity ${posts.id}`)
        cy.log(JSON.stringify(posts))
        cy.request('GET', `http://localhost:3000/posts/${posts.id}`)
          .then((response) => {
            expect(response.status).to.eq(200);
            checkPost(response.body, posts);
          })
          .then(() => {
            posts.firstname = 'Mykhailo';
            posts.lastname = 'Shvaliuk'
            cy.log(`Update post entity ${posts.id}`)
            cy.log(JSON.stringify(posts))
            cy.request('PUT', `http://localhost:3000/posts/${posts.id}`, posts)
              .then((response) => {
                expect(response.status).to.eq(200);
              })
              .then(() => {
                cy.log(`Get updated post entity ${posts.id}`)
                cy.log(JSON.stringify(posts))
                cy.request('GET', `http://localhost:3000/posts/${posts.id}`)
                  .then((response) => {
                    expect(response.status).to.eq(200);
                    checkPost(response.body, posts);
                  })
              })
          })
      });
  })

  it('API9', () => {
    cy.log('Delete non-existing post entity. Verify HTTP response status code')
    cy.log(JSON.stringify(posts))
    cy.request({
      method: 'DELETE',
      url: 'http://localhost:3000/posts',
      body: posts,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  })

  it('API10', () => {
    cy.log(`Create post entity ${posts.id}`)
    cy.log(JSON.stringify(posts))

    cy.request('POST', 'http://localhost:3000/posts', posts)
      .then((response) => {
        expect(response.status).to.eq(201);
        posts.id = response.body.id;
      })
      .then(() => {
        cy.log(`Get post entity ${posts.id}`)
        cy.log(JSON.stringify(posts))
        cy.request('GET', `http://localhost:3000/posts/${posts.id}`)
          .then((response) => {
            expect(response.status).to.eq(200);
            checkPost(response.body, posts);
          })
          .then(() => {
            posts.firstname = 'Mykhailo';
            posts.lastname = 'Shvaliuk'
            cy.log(`Update post entity ${posts.id}`)
            cy.log(JSON.stringify(posts))
            cy.request('PUT', `http://localhost:3000/posts/${posts.id}`, posts)
              .then((response) => {
                expect(response.status).to.eq(200);
              })
              .then(() => {
                cy.log(`Get updated post entity ${posts.id}`)
                cy.log(JSON.stringify(posts))
                cy.request('GET', `http://localhost:3000/posts/${posts.id}`)
                  .then((response) => {
                    expect(response.status).to.eq(200);
                    checkPost(response.body, posts);
                  })
                  .then(() => {
                    cy.log(`Delete post entity ${posts.id}`)
                    cy.log(JSON.stringify(posts))
                    cy.request('DELETE', `http://localhost:3000/posts/${posts.id}`)
                      .then((response) => {
                        expect(response.status).to.eq(200);
                      })
                      .then(() => {
                        cy.log(`Get deleted post entity ${posts.id}`)
                        cy.log(JSON.stringify(posts))
                        cy.request(
                          {
                            method: 'GET',
                            url: `http://localhost:3000/posts/${posts.id}`,
                            failOnStatusCode: false,
                          })
                          .then((response) => {
                            expect(response.status).to.eq(404);
                          })
                      })
                  })
              })
          })
      });
  })
})