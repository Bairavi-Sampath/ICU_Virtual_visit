export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "ICU Virtual Visit API",
    description: "Healthcare platform for virtual visits between patients, families, and nurses",
    version: "1.0.0",
    contact: {
      name: "ICU Virtual Visit Team"
    }
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development Server"
    }
  ],
  paths: {
    "/api/auth/signup": {
      post: {
        tags: ["Authentication"],
        summary: "Sign up - Create new account",
        description: "Register a new user account (Healthcare Staff or Family Member)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string", description: "User's full name" },
                  username: { type: "string", description: "Unique username (min 3 chars)" },
                  password: { type: "string", description: "Password (min 6 chars)" },
                  role: { type: "string", enum: ["nurse", "family"], description: "User role" }
                },
                required: ["fullName", "username", "password", "role"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Account created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    role: { type: "string" },
                    username: { type: "string" }
                  }
                }
              }
            }
          },
          "400": { description: "Invalid input or validation error" },
          "409": { description: "Username already exists" },
          "500": { description: "Failed to create account" }
        }
      }
    },
    "/api/auth/signin": {
      post: {
        tags: ["Authentication"],
        summary: "Sign in - Login to account",
        description: "Login with username and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  password: { type: "string" },
                  role: { type: "string", enum: ["nurse", "family"] }
                },
                required: ["username", "password", "role"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Sign in successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        username: { type: "string" },
                        name: { type: "string" },
                        role: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": { description: "Missing required fields" },
          "401": { description: "Invalid username or password" },
          "500": { description: "Failed to sign in" }
        }
      }
    },
    "/api/patients": {
      get: {
        tags: ["Patients"],
        summary: "Get all patients",
        description: "Fetch list of all patients with their status and active calls",
        responses: {
          "200": {
            description: "List of patients",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      room_number: { type: "string" },
                      status: { type: "string", enum: ["stable", "recovering", "critical"] },
                      scheduled_visit: { type: "string", nullable: true },
                      call_active: { type: "boolean" },
                      notes: { type: "array" }
                    }
                  }
                }
              }
            }
          },
          "500": { description: "Failed to fetch patients" }
        }
      }
    },
    "/api/patients/create": {
      post: {
        tags: ["Patients"],
        summary: "Create new patient",
        description: "Add a new patient to the system (Nurse only)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string", description: "Patient's full name (required, min 2 chars)" },
                  roomNumber: { type: "string", description: "Patient's room number (required, must be unique)" },
                  status: { type: "string", enum: ["stable", "recovering", "critical"], description: "Patient's health status (required)" }
                },
                required: ["fullName", "roomNumber", "status"]
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Patient created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    patient: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        full_name: { type: "string" },
                        room_number: { type: "string" },
                        status: { type: "string" },
                        created_at: { type: "string", format: "date-time" }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": { description: "Validation error - Missing or invalid fields" },
          "409": { description: "Room number already in use" },
          "500": { description: "Failed to create patient" }
        }
      }
    },
    "/api/patients/{patientId}": {
      get: {
        tags: ["Patients"],
        summary: "Get patient by ID",
        description: "Fetch detailed information for a specific patient",
        parameters: [
          {
            name: "patientId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Patient details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    room_number: { type: "string" },
                    status: { type: "string" },
                    call_active: { type: "boolean" },
                    notes: { type: "array" }
                  }
                }
              }
            }
          },
          "404": { description: "Patient not found" },
          "500": { description: "Failed to fetch patient" }
        }
      }
    },
    "/api/patients/{patientId}/call": {
      post: {
        tags: ["Calls"],
        summary: "Start or join a video call",
        description: "Initiate a new video call or join an existing one for a patient",
        parameters: [
          {
            name: "patientId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Call started successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    call_link: { type: "string", description: "Talky.io meeting link" },
                    room_name: { type: "string" },
                    visit_id: { type: "string" }
                  }
                }
              }
            }
          },
          "500": { description: "Failed to start call" }
        }
      },
      delete: {
        tags: ["Calls"],
        summary: "End a video call",
        description: "Mark the active call as completed",
        parameters: [
          {
            name: "patientId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Call ended successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" }
                  }
                }
              }
            }
          },
          "500": { description: "Failed to end call" }
        }
      }
    },
    "/api/patients/{patientId}/schedule": {
      post: {
        tags: ["Schedule"],
        summary: "Schedule a visit",
        description: "Schedule a new visit for a patient",
        parameters: [
          {
            name: "patientId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  date: { type: "string", description: "Date in YYYY-MM-DD format" },
                  time: { type: "string", description: "Time in HH:MM format" },
                  duration: { type: "number", description: "Duration in minutes" }
                },
                required: ["date", "time"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Visit scheduled successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" }
                  }
                }
              }
            }
          },
          "400": { description: "Invalid date/time or missing parameters" },
          "500": { description: "Failed to schedule visit" }
        }
      }
    },
    "/api/patients/{patientId}/notes": {
      post: {
        tags: ["Notes"],
        summary: "Add a note",
        description: "Add a new note for a patient",
        parameters: [
          {
            name: "patientId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  content: { type: "string" }
                },
                required: ["content"]
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Note added successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    content: { type: "string" },
                    created_at: { type: "string" },
                    author: { type: "string" }
                  }
                }
              }
            }
          },
          "500": { description: "Failed to add note" }
        }
      },
      get: {
        tags: ["Notes"],
        summary: "Get patient notes",
        description: "Fetch all notes for a specific patient",
        parameters: [
          {
            name: "patientId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Patient notes",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      content: { type: "string" },
                      created_at: { type: "string" },
                      author: { type: "string" }
                    }
                  }
                }
              }
            }
          },
          "500": { description: "Failed to fetch notes" }
        }
      }
    },
    "/api/patients/{patientId}/status": {
      get: {
        tags: ["Status"],
        summary: "Get call status",
        description: "Get the current status of calls for a patient",
        parameters: [
          {
            name: "patientId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": { description: "Call status" },
          "404": { description: "Patient not found" },
          "500": { description: "Failed to fetch status" }
        }
      }
    },
    "/api/patients/delete/{id}": {
      delete: {
        tags: ["Patients"],
        summary: "Delete patient",
        description: "Delete a patient record (only recovered and discharged patients can be deleted)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Patient ID"
          }
        ],
        responses: {
          "200": {
            description: "Patient deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    patient: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        room_number: { type: "string" },
                        status: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": { description: "Missing or invalid patient ID" },
          "404": { description: "Patient not found" },
          "500": { description: "Failed to delete patient" }
        }
      }
    },
    "/api/db/ping": {
      get: {
        tags: ["Database"],
        summary: "Test database connection",
        description: "Verify that the database is connected and responding",
        responses: {
          "200": {
            description: "Database is connected",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean" },
                    timestamp: { type: "string" }
                  }
                }
              }
            }
          },
          "500": { description: "Failed to connect to database" }
        }
      }
    }
  },
  components: {
    schemas: {
      Patient: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          room_number: { type: "string" },
          status: { type: "string", enum: ["stable", "recovering", "critical", "recovered", "discharged"] },
          call_active: { type: "boolean" },
          scheduled_visit: { type: "string", nullable: true }
        }
      },
      Note: {
        type: "object",
        properties: {
          id: { type: "string" },
          content: { type: "string" },
          created_at: { type: "string" },
          author: { type: "string" }
        }
      }
    }
  }
};
